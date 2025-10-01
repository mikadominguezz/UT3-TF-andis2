const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto files for communication with other services
const PRODUCT_PROTO_PATH = '/app/proto/product.proto';
const ORDER_PROTO_PATH = '/app/proto/order.proto';

const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const orderPackageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(productPackageDefinition).ProductService;
const orderProto = grpc.loadPackageDefinition(orderPackageDefinition).OrderService;

const productClient = new productProto('localhost:50054', grpc.credentials.createInsecure());
const orderClient = new orderProto('localhost:50053', grpc.credentials.createInsecure());

class ClientsService {

  // Get products for clients to browse
  async getProducts() {
    try {
      return new Promise((resolve, reject) => {
        productClient.GetProducts({}, (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.products || []);
          }
        });
      });
    } catch (error) {
      console.error('Service Error - getProducts:', error);
      throw new Error('Unable to fetch products');
    }
  }

  // Create order for clients
  async createOrder(orderData) {
    try {
      return new Promise((resolve, reject) => {
        orderClient.CreateOrder(orderData, (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    } catch (error) {
      console.error('Service Error - createOrder:', error);
      throw new Error('Unable to create order');
    }
  }
}

module.exports = new ClientsService();
