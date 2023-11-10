require ('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: "0.8.4",
   networks:{
    sepolia:{
      url: 'https://eth-sepolia.g.alchemy.com/v2/aXURLNbUSu1lMvjYrUc1cd3EH3Hi1LaV',
      accounts: ['3f8402621fa65e784b3923fb1a6c13c1828cbcbb44fc084f53163c9636ca54ed']
     }
    }
}
