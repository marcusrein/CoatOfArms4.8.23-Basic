const { expect } = require("chai");

describe("CoatOfArms", function () {
	let CoatOfArms, coatOfArms, owner, addr1, addr2;

	beforeEach(async function () {
		CoatOfArms = await ethers.getContractFactory("CoatOfArms");
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
		coatOfArms = await CoatOfArms.deploy();
	});

	describe("Deployment", function () {
		it("Should set the right owner", async function () {
			expect(await coatOfArms.owner()).to.equal(owner.address);
		});

		it("Should assign the total supply of tokens to the owner", async function () {
			const ownerBalance = await coatOfArms.balanceOf(owner.address);
			expect(await coatOfArms.totalSupply()).to.equal(ownerBalance);
		});
	});

	describe("Transactions", function () {
		it("Should fail if sender doesn’t have FAMILY_ROLE", async function () {
			await expect(
				coatOfArms.connect(addr1).addMember(addr2.address)
			).to.be.revertedWith("CoatOfArms: Address is not a family member");
		});

		it("Should mint a new token if sender has FAMILY_ROLE", async function () {
			await coatOfArms.addMember(addr1.address);
			await coatOfArms
				.connect(addr1)
				.safeMint(
					addr1.address,
					1,
					"https://example.com/token/1",
					["PowerWord1", "PowerWord2", "PowerWord3"],
					["Emotion1", "Emotion2", "Emotion3"]
				);
			expect(await coatOfArms.ownerOf(1)).to.equal(addr1.address);
			expect(await coatOfArms.tokenURI(1)).to.equal(
				"https://example.com/token/1"
			);
		});

		it("Should emit a NewMemberAdded event when a new member is added", async function () {
			await expect(coatOfArms.addMember(addr1.address))
				.to.emit(coatOfArms, "NewMemberAdded")
				.withArgs(addr1.address);
		});

		it("Should emit a FamilyNFTMinted event when a new token is minted", async function () {
			await coatOfArms.addMember(addr1.address);
			await expect(
				coatOfArms
					.connect(addr1)
					.safeMint(
						addr1.address,
						1,
						"https://example.com/token/1",
						["PowerWord1", "PowerWord2", "PowerWord3"],
						["Emotion1", "Emotion2", "Emotion3"]
					)
			)
				.to.emit(coatOfArms, "FamilyNFTMinted")
				.withArgs(
					addr1.address,
					1,
					"https://example.com/token/1",
					["PowerWord1", "PowerWord2", "PowerWord3"],
					["Emotion1", "Emotion2", "Emotion3"]
				);
		});

		it("Should return correct family members count after adding a new member", async function () {
			await coatOfArms.addMember(addr1.address);
			expect(await coatOfArms.familyMembersCount()).to.equal(2);
		});

		it("Should return correct family NFTs count after minting a new token", async function () {
			await coatOfArms.addMember(addr1.address);
			await coatOfArms
				.connect(addr1)
				.safeMint(
					addr1.address,
					1,
					"https://example.com/token/1",
					["PowerWord1", "PowerWord2", "PowerWord3"],
					["Emotion1", "Emotion2", "Emotion3"]
				);
			expect(await coatOfArms.familyNFTsCount()).to.equal(1);
		});
	});
});
