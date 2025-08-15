// Debug wrapper for fetch to capture problematic requests
const originalFetch = window.fetch;

export function enableFetchDebugging() {
  if (typeof window === 'undefined') return; // Skip on server-side

  window.fetch = async function debugFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    console.group(`🔍 FETCH DEBUG: ${url}`);
    console.log('URL:', url);
    console.log('Method:', init?.method || 'GET');
    
    // Log headers with special attention to problematic ones
    if (init?.headers) {
      console.log('Headers:');
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          console.log(`  ${key}: "${value}"`);
          // Check for invalid characters
          if (!/^[\x20-\x7E]*$/.test(value)) {
            console.warn(`⚠️ INVALID HEADER VALUE: "${key}" contains non-ASCII characters!`);
          }
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          console.log(`  ${key}: "${value}"`);
          if (!/^[\x20-\x7E]*$/.test(value)) {
            console.warn(`⚠️ INVALID HEADER VALUE: "${key}" contains non-ASCII characters!`);
          }
        });
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          console.log(`  ${key}: "${value}"`);
          if (typeof value === 'string' && !/^[\x20-\x7E]*$/.test(value)) {
            console.warn(`⚠️ INVALID HEADER VALUE: "${key}" contains non-ASCII characters!`);
          }
        });
      }
    }
    
    // Log body
    if (init?.body) {
      console.log('Body:', init.body);
      if (typeof init.body === 'string') {
        try {
          console.log('Parsed Body:', JSON.parse(init.body));
        } catch (e) {
          console.log('Body (raw string):', init.body);
        }
      }
    }
    
    // Check for invalid method
    if (init?.method && init.method === 'GET' && init.body) {
      console.error('🚨 INVALID: GET request with body!');
    }
    
    // Log other potentially problematic options
    if (init?.mode) console.log('Mode:', init.mode);
    if (init?.credentials) console.log('Credentials:', init.credentials);
    if (init?.cache) console.log('Cache:', init.cache);
    if (init?.redirect) console.log('Redirect:', init.redirect);
    if (init?.referrer) console.log('Referrer:', init.referrer);
    if (init?.referrerPolicy) console.log('Referrer Policy:', init.referrerPolicy);
    if (init?.integrity) console.log('Integrity:', init.integrity);
    if (init?.keepalive) console.log('Keep Alive:', init.keepalive);
    if (init?.signal) console.log('Signal:', init.signal);
    
    console.groupEnd();
    
    try {
      const response = await originalFetch(input, init);
      console.log(`✅ FETCH SUCCESS: ${url} - ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ FETCH ERROR: ${url}`, error);
      
      // Log the exact error details
      if (error instanceof TypeError && error.message.includes('Invalid value')) {
        console.error('🚨 INVALID VALUE ERROR DETECTED!');
        console.error('This is likely caused by:');
        console.error('1. Invalid characters in headers');
        console.error('2. Invalid URL');
        console.error('3. Invalid request method');
        console.error('4. GET request with body');
        console.error('5. Invalid fetch options');
      }
      
      throw error;
    }
  };
  
  console.log('🔍 Fetch debugging enabled');
}