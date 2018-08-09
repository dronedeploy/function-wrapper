declare module '@dronedeploy/functions-wrapper' {

  import * as e from "express";

  /**
   * The datastore provides an interface for accessing functionality for the DroneDeploy datastore:
   *
   * https://developer.dronedeploy.com/docs/sdk-beta/datastore.html
   */
  interface Datastore {

    /**
     * Finds the table ID by its name
     *
     * @param {string} name The name of the table
     * @param {string} slug The application slug
     * @returns {Promise<string>} The table ID
     */
    findTableByName(name: string, slug: string): Promise<string>;

    /**
     * Gets a reference to the table object
     *
     * @param {string} tableId The table ID
     * @returns {Promise<module:dronedeploy/functions-wrapper.Table>} The table
     */
    table(tableId: string): Promise<Table>;

  }

  /**
   * Response returned from a datastore mutation
   */
  interface MutationResponse {
    ok: boolean;
    error?: any;
  }

  /**
   * Interactions with a table.
   */
  interface Table {
    /**
     * Inserts a row
     *
     * @param {string} externalId The external ID
     * @param row
     * @returns {Promise<module:dronedeploy/functions-wrapper.MutationResponse>}
     */
    addRow(externalId: string, row: any): Promise<MutationResponse>;

    /**
     * Updates a row
     *
     * @param {string} externalId The external ID
     * @param row
     * @returns {Promise<module:dronedeploy/functions-wrapper.MutationResponse>}
     */
    editRow(externalId: string, row: any): Promise<MutationResponse>;

    /**
     * Upserts a row
     *
     * @param {string} externalId The external ID
     * @param row
     * @returns {Promise<module:dronedeploy/functions-wrapper.MutationResponse>}
     */
    upsertRow(externalId: string, row: any): Promise<MutationResponse>;

    /**
     * Retrieves a row of data by ID
     *
     * @param {string} externalId The external ID
     * @returns {Promise<any>} The row of data
     */
    getRowByExternalId(externalId: string): Promise<any>;
  }

  /**
   * If you are an owner, then you can access additional admin functionality
   */
  interface OwnerDatastore extends Datastore {

    /**
     * Creates a table
     *
     * @param {string} appSlug
     * @param {string} tableName
     * @param {string} description
     * @param columnDefinitions
     * @returns {Promise<string>}
     */
    createTable(appSlug: string, tableName: string, description: string, columnDefinitions: ColumnDefinitionInput[]): Promise<string>

    /**
     * Ensures that a table exists before trying trying to create.
     *
     * @param {string} appSlug
     * @param {string} tableName
     * @param {string} description
     * @param columnDefinitions
     * @returns {Promise<string>}
     */
    ensure(appSlug: string, tableName: string, description: string, columnDefinitions?: ColumnDefinitionInput[]): Promise<string>
  }

  interface ColumnDefinitionInput {
    input: ColumnDefinition
  }

  /**
   * The different types of column definitions.
   */
  type ColumnDefinition =
    DateColumnDefinition | DateTimeColumnDefinition | EmailColummDefinition | NumberColumnDefinition | TextColumnDefinition;

  /**
   * The string literals for column types.
   */
  type ColumnType = "DATE" | "DATETIME" | "EMAIL" | "NUMBER" | "TEXT";

  /**
   * Common properties on all columns
   */
  interface GenericColumnDefinition<T extends ColumnType> {
    columnType: T;
    name: string;
    description: string;
    nullabe?: string;
  }

  /**
   * Represents DATE columns
   */
  interface DateColumnDefinition extends GenericColumnDefinition<"DATE"> {
  }

  /**
   * Represents DATETIME columns
   */
  interface DateTimeColumnDefinition extends GenericColumnDefinition<"DATETIME"> {
  }

  /**
   * Represents EMAIL columns
   */
  interface EmailColummDefinition extends GenericColumnDefinition<"EMAIL"> {
  }

  /**
   * Represents NUMBER columns
   */
  interface NumberColumnDefinition extends GenericColumnDefinition<"NUMBER"> {
    numberType: NumberType;
  }

  /**
   * The type of number to represent
   */
  type NumberType = "INTEGER" | "FLOAT";

  /**
   * Reprents TEXT columns
   */
  interface TextColumnDefinition extends GenericColumnDefinition<"TEXT"> {
    textLength?: number;
    textEncrypted?: boolean;
  }

  interface GraphQL {

    /**
     * Runs a query against the GraphQL API
     *
     * @param {string} query
     * @param {any[]} variables
     * @returns {Promise<any>}
     */
    query(query: string, variables?: any[]): Promise<any>;

  }

  /**
   * The request object passed into the function
   */
  interface Request extends e.Request {
    ctx: Context
  }

  /**
   * The response object passed into the function
   */
  interface Response extends e.Response {
  }

  /**
   * The function callback is passed into every function request.
   *
   * If an error is present, then it has already been sent to the client so the response
   * object cannot be mutated.
   */
  type FunctionCallback =  (err: any | undefined, context: Context) => void;

  type JwtToken = string | any;

  /**
   * The base interface for the Function context
   */
  interface BaseContext {
    token: JwtToken;
    originalToken: JwtToken;
    graphql: GraphQL;
    as<T extends boolean>(jwt: JwtToken, isOwner: T): T extends true ? AdminContext : Context;
  }

  /**
   * The context passed into every function invocation.
   */
  interface Context extends BaseContext {
    datastore: Datastore;
  }

  /**
   * If the user elevates their context to the owner context, then they get additional datastore functionality.
   */
  interface AdminContext extends BaseContext {
    datastore: OwnerDatastore,
  }

  /**
   * Allows consumers to pass in an array of CORS headers to be set by default for every
   * function invocation.
   */
  interface Cors {
    headers?: string[],
  }

  /**
   * Additional configuration
   */
  interface NestedConfig {
    cors?: Cors;
    [key: string]: any;
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
     * Indicates whether to mock the token; useful for development purposes. If this is set to true, then
     * authRequired must be set to false.
     */
    mockToken?: boolean,

    /**
     * Additional configuration
     */
    config?: NestedConfig
  }

  /**
   * The bootstrap function is used for wrapping your code with DroneDeploy specific logic for every request.
   * The wrapper method will handle authentication, default responses for auth failures and OPTIONS routes,
   * and setup CORS headers for your functions.
   *
   * @param {module:dronedeploy/functions-wrapper.Config} config
   * @param {module:dronedeploy/functions-wrapper.Request} req The HTTP request
   * @param {module:dronedeploy/functions-wrapper.Response} res The HTTP response
   * @param {module:dronedeploy/functions-wrapper.FunctionCallback} callback
   */
  export function bootstrap(config: Config, req: Request, res: Response, callback: FunctionCallback): void;
}
