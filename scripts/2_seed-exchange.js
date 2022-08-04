const { ethers } = require("hardhat");
const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
async function main() {
    const accounts = await ethers.getSigners()

    const { chainId } = await ethers.provider.getNetwork()
    console.log("Using chainID:", chainId);

    const dAPP = await ethers.getContractAt('Token', config[chainId].dAPP.address)
    console.log(`dAPPtoken fetched: ${dAPP.address}`)

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mETH token fetched: ${mETH.address}`)

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI token fetched: ${mDAI.address}`)

    // Fetch deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange token fetched: ${exchange.address}`)

    // Give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    // user1 transfers 10,000 mETH
    let transaction, result
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address} \n`);

    // Setup exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)

    // user1 approves 10,000 Dapp
    transaction = await dAPP.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`);

    // user1 deposits 10,000 dAPP
    transaction = await exchange.connect(user1).depositToken(dAPP.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from  ${user1.address}\n`);

    // user2 approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`);

    // user2 deposits mETH
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} tokens from  ${user2.address}\n`);

    // seed a cancelled order
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dAPP.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // user1 cancel order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}`);

    // Wait 1 second
    await wait(1)

    // User1 makes an order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dAPP.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // user2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}`);

    // Wait 1 second
    await wait(1)

    // User1 makes an order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), dAPP.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // user2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}`);

    // Wait 1 second
    await wait(1)

    // User1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), dAPP.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // user2 fills final order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}`);

    // Wait 1 second
    await wait(1)

    // seed open orders
    // User1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), dAPP.address, tokens(10))
        result = await transaction.wait()
        console.log(`Made order form ${user1.address}`)
        await wait(1)
    }

    // User2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(dAPP.address, tokens(10), mETH.address, tokens(10 * i))
        result = await transaction.wait()
        console.log(`Made order form ${user2.address}`)
        await wait(1)
    }


}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
