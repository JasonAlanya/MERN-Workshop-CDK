import { Category, CategoryItem } from "../src/models/Category";
import { addCorsHeader } from "./utils";

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const CATEGORY_TABLE_NAME = process.env.CATEGORY_TABLE_NAME;

async function saveCategory(category: CategoryItem) {
  const params = {
    TableName: CATEGORY_TABLE_NAME,
    Item: category,
  };

  return dynamodb
    .put(params)
    .promise()
    .then(() => {
      return category;
    });
}

async function getCategories() {
  const params = {
    ExpressionAttributeValues: {
      ":pk": "shopid#10",
    },
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    KeyConditionExpression: "#pk = :pk",
    TableName: CATEGORY_TABLE_NAME,
  };
  return dynamodb.query(params).promise();
}

async function updateCategories(categoryId: string, categoryBody: any) {
  const params = {
    TableName: CATEGORY_TABLE_NAME,
    Key: { pk: "shopid#10", sk: `categoryid#${categoryId}` },
    UpdateExpression:
      "SET #name = :name, #photoType = :photoType, #parentId = :parentId",
    ExpressionAttributeNames: {
      "#name": "categoryName",
      "#photoType": "photoType",
      "#parentId": "categoryParent_id",
    },
    ExpressionAttributeValues: {
      ":name": categoryBody.categoryName,
      ":photoType": categoryBody.photoType,
      ":parentId": categoryBody.categoryParent_id,
    },
  };
  return dynamodb.update(params).promise();
}

async function deleteCategory(categoryId: string) {
  const params = {
    TableName: CATEGORY_TABLE_NAME,
    Key: { pk: `shopid#10`, sk: `categoryid#${categoryId}` },
  };
  return dynamodb.delete(params).promise();
}

export async function handler(event: any, context: any): Promise<any> {
  console.log("Event", event);
  console.log("Context", context);

  const method = event.httpMethod;
  const categoryid = event.pathParameters
    ? event.pathParameters.categoryId
    : null;
  let responseBody = "";

  switch (method) {
    case "GET":
      const results = await getCategories();
      responseBody = JSON.stringify(results);
      break;
    case "POST":
      const categoryData: Category = JSON.parse(event.body);
      const category = {
        pk: "shopid#10",
        sk: "categoryid#" + categoryData.id,
        categoryName: categoryData.categoryName,
        photoType: categoryData.photoType,
        categoryParent_id: categoryData.categoryParent_id,
      };
      const savedCategory = await saveCategory(category);
      responseBody = JSON.stringify(savedCategory);
      //responseBody = JSON.stringify(event.body);
      break;
    case "PATCH":
      const categoryBody = JSON.parse(event.body);
      await updateCategories(categoryid, categoryBody);
      responseBody = "Category updated";
      break;
    case "DELETE":
      deleteCategory(categoryid);
      responseBody = "Category deleted";
      break;
    default:
      responseBody = "nothing";
      break;
  }

  //const messageBody = JSON.parse(event.body);
  const response = {
    statusCode: 200,
    body: responseBody,
    headers: {},
  };
  addCorsHeader(response);
  return response;
}
