require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const formidable = require("formidable");

async function main() {
    console.log("Azure Blob storage v12 - JavaScript quickstart sample");
    // Quick start code goes here
}

main()
    .then(() => console.log("Done"))
    .catch((ex) => console.log(ex.message));

// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

module.exports.uploadBlob = async (req, res, next) => {
    console.log(req.body);

    const containerName = req.body.containerName;
    const content = req.body.content;
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
    res.json({ requestId, blobName: name });
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

const a = async () => {
    const b = await checkContainer(blobServiceClient, "thumbnails");
    console.log(b);
};
