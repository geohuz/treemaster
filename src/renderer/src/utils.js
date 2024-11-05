export function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      }
    }
  };
}

export function getError(error) {
  // let xxx = 
  //   [ 
  //     error?.response?.data?.message ?? error.message,
  //     {status: error?.response?.status  ?? 599,
  //      statusText: error?.response?.statusText ?? '' 
  //     }   
  //   ]
  let xxx
  if (error.response) {
    xxx = [
       error?.response?.data?.message ?? error.response.data,
       {status: error?.response?.status ?? error.response.status,
       statusText: error?.response?.statusText ?? ''
      }
    ]
  } else {
    xxx = [
      error.message,
      {status: error.code, statusText: error.message}
    ]
  }
  return xxx
}
