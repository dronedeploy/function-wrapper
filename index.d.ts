declare module 'dronedeploy/datastore' {

}



declare module 'dronedeploy/functions-wrapper' {

  import {Request, Response} from "express";

  /**
   * The function callback is passed into every function request.
   *
   * If an error is present, then it has already been sent to the client so the response
   * object cannot be mutated.
   */
  type FunctionCallback =  (err: Error | undefined, context: FunctionContext) => void;

  /**
   * The context passed into every function invocation.
   */
  interface FunctionContext {
    token: string
    originalToken: string
  }

  /**
   * Allows consumers to pass in an array of CORS headers to be set by default for every
   * function invocation.
   */
  interface Cors {
    headers?: string[],
  }

  /**
   * Configuration for the function
   */
  interface Config {

    /**
     * Indicates that authorization is required for the function and will return 401 if a valid
     * DroneDeploy JWT token is not in the request headers.
     */
    authRequired: boolean;

    /**
     * Indicates whether to mock the token; useful for development purposes
     */
    mockToken?: string,

    /**
     * Configuration for CORS headers
     */
    cors?: Cors
  }

  /**
   * The bootstrap function is used for wrapping your code with DroneDeploy specific logic for every request.
   * The wrapper method will handle authentication, default responses for auth failures and OPTIONS routes,
   * and setup CORS headers for your functions.
   *
   * @param {module:dronedeploy/functions-wrapper.Config} config
   * @param {e.Request} req The HTTP request
   * @param {e.Response} res The HTTP response
   * @param {module:dronedeploy/functions-wrapper.FunctionCallback} callback
   */
  export default function bootstrap(config: Config, req: Request, res: Response, callback: FunctionCallback): void;

}

