import { Product, ProductItem } from "../src/models/products";
import { addCorsHeader } from "./utils";

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCT_TABLE_NAME = process.env.PRODUCT_TABLE_NAME;

async function saveProduct(product: ProductItem) {
  const params = {
    TableName: PRODUCT_TABLE_NAME,
    Item: product,
  };

  return dynamodb
    .put(params)
    .promise()
    .then(() => {
      return product;
    });
}

async function getProducts() {
  const params = {
    ExpressionAttributeValues: {
      ":pk": "shopid#10",
    },
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    KeyConditionExpression: "#pk = :pk",
    TableName: PRODUCT_TABLE_NAME,
  };
  return dynamodb.query(params).promise();
}

async function updateProducts(productId: string, productBody: any) {
  const params = {
    TableName: PRODUCT_TABLE_NAME,
    Key: { pk: "shopid#10", sk: `productid#${productId}` },
    UpdateExpression:
      "SET #name = :name, #weight = :weight, #cannabisWeight = :cannabisWeight, #price = :price, #fee = :fee, #sku = :sku, #imageURL = :imageURL, #barcode = :barcode, #description = :description, #cannabisVolume = :cannabisVolume , #isActive = :isActive, #createDate = :createDate, #updateDate = :updateDate, #fullProductName = :fullProductName, #productSlug = :productSlug, #salesPrice = :salesPrice , #inventory = :inventory, #discountAmount = :discountAmount, #productscol = :productscol, #categories_id = :categories_id, #supplier_id = :supplier_id",
    ExpressionAttributeNames: {
      "#name": "categoryName",
      "#weighte": "weight",
      "#cannabisWeight": "cannabisWeight",
      "#price": "price",
      "#fee": "fee",
      "#sku": "sku",
      "#imageURL": "imageURL",
      "#barcode": "barcode",
      "#description": "description",
      "#cannabisVolume": "cannabisVolume",
      "#isActive": "isActive",
      "#createDate": "createDate",
      "#updateDate": "updateDate",
      "#fullProductName": "fullProductName",
      "#productSlug": "productSlug",
      "#salesPrice": "salesPrice",
      "#inventory": "inventory",
      "#discountAmount": "discountAmount",
      "#productscol": "productscol",
      "#categories_id": "categories_id",
      "#supplier_id": "supplier_id",
    },
    ExpressionAttributeValues: {
      ":name": productBody.name,
      ":weight": productBody.weight,
      ":cannabisWeight": productBody.cannabisWeight,
      ":price": productBody.price,
      ":fee": productBody.fee,
      ":sku": productBody.sku,
      ":imageURL": productBody.imageURL,
      ":barcode": productBody.barcode,
      ":description": productBody.description,
      ":cannabisVolume": productBody.cannabisVolume,
      ":isActive": productBody.isActive,
      ":createDate": productBody.createDate,
      ":updateDate": productBody.updateDate,
      ":fullProductName": productBody.fullProductName,
      ":productSlug": productBody.productSlug,
      ":salesPrice": productBody.salesPrice,
      ":inventory": productBody.inventory,
      ":discountAmount": productBody.discountAmount,
      ":productscol": productBody.productscol,
      ":categories_id": productBody.categories_id,
      ":supplier_id": productBody.supplier_id,
    },
  };
  return dynamodb.update(params).promise();
}

async function deleteProduct(productId: string) {
  const params = {
    TableName: PRODUCT_TABLE_NAME,
    Key: { pk: `shopid#10`, sk: `categoryid#${productId}` },
  };
  return dynamodb.delete(params).promise();
}

export async function handler(event: any, context: any): Promise<any> {
  console.log("Event", event);
  console.log("Context", context);

  const method = event.httpMethod;
  const productid = event.pathParameters
    ? event.pathParameters.productId
    : null;
  let responseBody = "";

  switch (method) {
    case "GET":
      const results = await getProducts();
      responseBody = JSON.stringify(results);
      break;
    case "POST":
      const productData: Product = JSON.parse(event.body);
      const product = {
        pk: "shopid#10",
        sk: "productid#" + productData.id,
        name: productData.name,
        weight: productData.weight,
        cannabisWeight: productData.cannabisWeight,
        price: productData.price,
        fee: productData.fee,
        sku: productData.sku,
        imageURL: productData.imageURL,
        barcode: productData.barcode,
        description: productData.description,
        cannabisVolume: productData.cannabisVolume,
        isActive: productData.isActive,
        createDate: productData.createDate,
        updateDate: productData.updateDate,
        fullProductName: productData.fullProductName,
        productSlug: productData.productSlug,
        salesPrice: productData.salesPrice,
        inventory: productData.inventory,
        discountAmount: productData.discountAmount,
        productscol: productData.productscol,
        categories_id: productData.categories_id,
        supplier_id: productData.supplier_id,
      };
      const savedProduct = await saveProduct(product);
      responseBody = JSON.stringify(savedProduct);
      //responseBody = JSON.stringify(event.body);
      break;
    case "PATCH":
      const categoryBody = JSON.parse(event.body);
      await updateProducts(productid, categoryBody);
      responseBody = "Product updated";
      break;
    case "DELETE":
      deleteProduct(productid);
      responseBody = "Product deleted";
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
