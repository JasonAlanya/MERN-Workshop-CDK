export function addCorsHeader(response: any) {
  response.headers["Access-Control-Allow-Origin"] = "*";
  response.headers["Access-Control-Allow-Headers"] =
    "Content-Type, X-Amz-Date, Authorization, X-Api-Key";
  response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
}
