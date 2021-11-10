require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const azureStorage = require("azure-storage");
const storage = require("@azure/storage-blob");

const cerds = new storage.StorageSharedKeyCredential(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);

const blobService = azureStorage.createBlobService();
// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

module.exports.uploadFile = async (containerName, blobName, file_buffer) => {
    const client = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = client.getBlockBlobClient(blobName);
    const state = await blockBlobClient
        .uploadData(file_buffer)
        .then(() => {
            console.log("uploaded file");
            return true;
        })
        .catch((err) => {
            console.log("err on upload file");
            console.log(err.message);
            return false;
        });
    return state;
};

module.exports.getMetaDataOnBlob = async (containerName, blobName) => {
    let result;
    blobService.getBlobMetadata(containerName, blobName, function (err, result, response) {
        console.log("response: ", response);
        if (err) {
            console.error("Couldn't fetch metadata for blob %s", blobName);
            console.error(err);
        } else if (!response.isSuccessful) {
            console.error("Blob %s wasn't found container %s", blobName, containerName);
        } else {
            console.log("Successfully fetched metadata for blob %s", blobName);
            console.log(result.metadata);
            result = result.metadata;
        }
    });
    return result;
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

module.exports.getSASUrl = async (containerName, blobName) => {
    const client = blobServiceClient.getContainerClient(containerName);

    const startsOn = new Date();
    startsOn.setMinutes(startsOn.getMinutes() - 5);
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 60);

    const blobSAS = storage
        .generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions: storage.BlobSASPermissions.parse("racwd"),
                startsOn,
                expiresOn,
            },
            cerds
        )
        .toString();

    //to upload file client.url + filename +"?" + blobSAS
    const sasUrl = client.url + "/" + blobName + "?" + blobSAS;
    console.log("SAS URL IS " + sasUrl);
    return sasUrl;
};

module.exports.DeleteFile = async (containerName, blobName) => {
    const client = blobServiceClient.getContainerClient(containerName);
    const blobClient = client.getBlobClient(blobName);

    const exists = await blobClient.exists();

    if (exists) {
        const state = await blobClient
            .delete()
            .then(() => {
                console.log("deleted file");
                return true;
            })
            .catch((err) => {
                console.log("err on file delete");
                console.log(err.message);
                return false;
            });

        return state;
    } else {
        console.log("file does not exist to delete");
        return false;
    }
};

module.exports.deleteBlobCosmos = async (user_id, filename) => {
    return await File.deleteOne({ user_id: user_id, filename: filename })
        .then(() => {
            console.log("file deleted in DB");
            return true;
        })
        .catch((err) => {
            console.log("err on file delete in DB");
            console.log(err.message);
            return false;
        });
};
