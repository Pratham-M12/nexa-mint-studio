const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
    let MyNFT;
    let owner, addr1, addr2;

    // Runs before each test — deploys a fresh contract instance
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MyNFT = await ethers.getContractFactory("MyNFT");
        myNFT = await MyNFT.deploy();
        await myNFT.waitForDeployment();
    });

    it("should set the correct name and symbol", async function () {
        expect(await myNFT.name()).to.equal("MyCollegeNFT");
        expect(await myNFT.symbol()).to.equal("MCNFT");
    });

    it("should mint a token and assign it to the caller", async function () {
        const tx = await myNFT.connect(addr1).mintNFT("ipfs://fake-metadata-cid");
        await tx.wait();

        expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
        expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("should store and return the correct tokenURI", async function () {
        await myNFT.connect(addr1).mintNFT("ipfs://fake-metadata-cid");
        expect(await myNFT.tokenURI(0)).to.equal("ipfs://fake-metadata-cid");
    });

    it("should increment token IDs correctly across multiple mints", async function () {
        await myNFT.connect(addr1).mintNFT("ipfs://cid-1");
        await myNFT.connect(addr1).mintNFT("ipfs://cid-2");
        expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
        expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
        expect(await myNFT.totalMinted()).to.equal(2);
    });

    it("should allow the owner to transfer their NFT", async function () {
        await myNFT.connect(addr1).mintNFT("ipfs://fake-metadata-cid");
        await myNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
        expect(await myNFT.ownerOf(0)).to.equal(addr2.address);
    });

    it("should revert when querying a non-existent token", async function () {
        await expect(myNFT.ownerOf(999)).to.be.reverted;
    });

    it("should revert if a non-owner tries to transfer a token they don't own", async function () {
        await myNFT.connect(addr1).mintNFT("ipfs://fake-metadata-cid");
        await expect(
            myNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 0)
        ).to.be.reverted;
    });
});