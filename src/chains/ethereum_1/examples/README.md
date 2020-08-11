# Examples

This directory provides example code for a variety of use cases. The intention here is to demonstrate common usage patterns. Examples are in Typescript but can easily be converted to Javascript by removing the types included in the code.

In many cases, you can copy and modify the code as-is, however, importing chainJS chains, models, and helpers would be different in your code.

### Setup

Create an .env file in the root of the examples. You can copy .example.env to .env to start and then populate it with your values.

To run the example code, you may need to install the npm ts-node package 
```bash
  npm i -g ts-node typescript
```

### Running examples

Comment-out parts of the example or modify it as desired and then run the ts file using ts-node
```bash
   ts-node transaction.ts
```

### Learning from example code

Start by reviewing the transaction examples. It demonstrates several patterns for transferring Eth and ERC20 tokens and much more. Uncomment the section you want to run and then run the transaction.ts file
