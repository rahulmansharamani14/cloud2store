require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const formidable = require("formidable");

// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

module.exports.uploadBlob = async (containerName, content) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    let requestId = "";
    let name = "";
    try {
        const blobName = "conatiner1blob";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
        requestId = uploadBlobResponse.requestId;
        name = blobName;
    } catch (err) {
        console.error("err:::", err);
    }

    const data = { requestId, blobName: name };
    return data;
};

module.exports.listBlob = async (containerID) => {
    let result = [];
    const containerClient = blobServiceClient.getContainerClient(containerID);

    try {
        let blobs = containerClient.listBlobsFlat();
        for await (const blob of blobs) {
            result.push(blob.name);
        }
    } catch (err) {
        console.error("err:::", err);
    }
    return result;
};

module.exports.deleteBlob = async (req, res, next) => {
    console.log("\nDeleting container...");

    //const containerName = 'quickstart' + uuidv1();
    const containerName = blobServiceClient.getContainerClient("mycontainer");
    console.log("\t", containerName.containerName);
    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(containerName.containerName);

    // Delete container
    const deleteContainerResponse = await containerClient.delete();
    console.log("Container was deleted successfully. requestId: ", deleteContainerResponse.requestId);
};

const checkContainer = async (blobServiceClient, inputContainer) => {
    let boolContainer = true;
    let i = 1;
    const constainers = [];
    try {
        for await (const container of blobServiceClient.listContainers()) {
            console.log(`Container ${i++}: ${container.name}`);

            if (container.name != inputContainer) {
                boolContainer = true;
            } else {
                boolContainer = false;
            }

            //console.log(container);
            constainers.push(container.name);
        }
    } catch (err) {
        console.error("err:::", err);
    }
    return boolContainer;
};

module.exports.createContainer = async (containerName) => {
    console.log("\nCreating container...");
    console.log("\t", containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
};

const downloadBlob = async (containerName, blobName) => {
    // const containerName = req.params.containerName
    // const blobName = req.params.blobName
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
    console.log("Downloaded blob content:", downloaded);

    async function streamToBuffer(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", (data) => {
                chunks.push(data instanceof Buffer ? data : Buffer.from(data));
            });
            readableStream.on("end", () => {
                resolve(Buffer.concat(chunks));
            });
            readableStream.on("error", reject);
        });
    }

    const data = {
        content: downloaded,
    };
    return data;
};

const deleteBlobs = async (containerName, blobName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    const response = await blobClient.deleteIfExists();
    console.log(response.requestId);

    const data = {
        requestId: response.requestId,
    };

    return data;

};



// const a = async () => {
//     const b = await downloadBlob("617a9471f8a5ce375280474b", "Profile.png");
//     console.log(b);
// };
