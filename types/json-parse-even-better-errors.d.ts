declare module "json-parse-even-better-errors" {
  interface JsonParseError extends SyntaxError {
    code: "EJSONPARSE";
    position: number;
    systemError?: Error;
  }

  function parseJson(input: string): unknown;

  export default parseJson;
}
