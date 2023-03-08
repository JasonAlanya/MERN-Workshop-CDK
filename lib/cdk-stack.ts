import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import path = require("path");
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Create dynamodb table for products
    const productTable = new dynamodb.Table(this, "ProdcutTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
    });

    //Create dynamodb table for categories
    const categoryTable = new dynamodb.Table(this, "CategoryTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
    });

    //Create lambda function for products
    const productHandler = new lambda.Function(this, "ProductHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "product.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
      environment: {
        PRODUCT_TABLE_NAME: productTable.tableName,
      },
    });

    //Create lambda function for categories
    const categoryHandler = new lambda.Function(this, "CategoryHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "category.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
      environment: {
        CATEGORY_TABLE_NAME: categoryTable.tableName,
      },
    });

    //Create SQS Queue
    const productQueue = new sqs.Queue(this, "ProductQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    productHandler.addEventSource(new SqsEventSource(productQueue));

    //Permissions
    productTable.grantReadWriteData(productHandler);
    categoryTable.grantReadWriteData(categoryHandler);

    //Create the api gateway
    const productApi = new apigateway.RestApi(this, "ProductApi");

    //Creating CORS interaction
    const corsOptions: apigateway.CorsOptions = {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "PATCH", "DELETE"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ],
    };

    //Create products resource
    const productResource = productApi.root.addResource("products");
    productResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(productHandler)
    );
    productResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(productHandler)
    );
    productResource.addCorsPreflight(corsOptions);

    //Create productId resource
    const productByIdResource = productResource.addResource(`{productId}`);
    productByIdResource.addMethod(
      "PATCH",
      new apigateway.LambdaIntegration(productHandler)
    );
    productByIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(productHandler)
    );
    productByIdResource.addCorsPreflight(corsOptions);

    //Create categories resource
    const categoryResource = productApi.root.addResource("categories");
    categoryResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(categoryHandler)
    );
    categoryResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(categoryHandler)
    );
    categoryResource.addCorsPreflight(corsOptions);

    //Create categoryId resource
    const categoryByIdResource = categoryResource.addResource(`{categoryId}`);
    categoryByIdResource.addMethod(
      "PATCH",
      new apigateway.LambdaIntegration(categoryHandler)
    );
    categoryByIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(categoryHandler)
    );
    categoryByIdResource.addCorsPreflight(corsOptions);

    //Add routes ti the API Gateway
    /*productApi.root
      .resourceForPath("product")
      .addMethod("GET", new apigateway.LambdaIntegration(productHandler));*/
  }
}
