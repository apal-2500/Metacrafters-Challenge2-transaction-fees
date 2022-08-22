// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        167,  49, 204,  39,  86,  51, 234,  90, 126, 206, 226,
        162,  57, 146, 226,  92,  35,  16, 165, 181, 147,  64,
         72,  39,   7, 191,  59, 135, 134,  20, 236, 100,  60,
        218, 106, 133, 211, 101, 125, 219, 214, 162, 104, 106,
         89, 238, 155,  97,  20,  21,  35, 137,  20,  58, 213,
         31, 194, 211,  88, 167, 116, 115,  28, 204
      ]            
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    //get from wallet balance
    let fromBalance = await connection.getBalance(new PublicKey(from.publicKey));
    console.log("From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);

    //Identify amount to send
    let sendBal = (fromBalance)/2;
    console.log("Send:", sendBal/LAMPORTS_PER_SOL);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: sendBal
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    //final balance print out
    fromBalance = await connection.getBalance(new PublicKey(from.publicKey));
    let toBalance = await connection.getBalance(new PublicKey(to.publicKey));
    console.log("From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);
    console.log("To Balance:", parseInt(toBalance)/LAMPORTS_PER_SOL);
}

transferSol();
