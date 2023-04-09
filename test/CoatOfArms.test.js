const { expect } = require('chai')

describe('CoatOfArms', function () {
    let CoatOfArms, coatOfArms, owner, addr1, addr2

    beforeEach(async function () {
        CoatOfArms = await ethers.getContractFactory('CoatOfArms')
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
        coatOfArms = await CoatOfArms.deploy()
    })

    describe('Deployment', function () {
        it('Should set the right admin and family role', async function () {
            const adminRole = await coatOfArms.DEFAULT_ADMIN_ROLE()
            const familyRole = await coatOfArms.FAMILY_ROLE()
            expect(await coatOfArms.hasRole(adminRole, owner.address)).to.be
                .true
            expect(await coatOfArms.hasRole(familyRole, owner.address)).to.be
                .true
        })
    })

    describe('Add Member', function () {
        it('Should add a family member correctly and emit NewMemberAdded event', async function () {
            await coatOfArms
                .connect(owner)
                .addMember(owner.address, addr1.address)

            // Check if the new member has the FAMILY_ROLE
            const hasFamilyRole = await coatOfArms.hasRole(
                coatOfArms.FAMILY_ROLE(),
                addr1.address
            )
            expect(hasFamilyRole).to.be.true

            // Check if the NewMemberAdded event is emitted correctly
            await expect(
                coatOfArms
                    .connect(owner)
                    .addMember(owner.address, addr2.address)
            )
                .to.emit(coatOfArms, 'NewMemberAdded')
                .withArgs(owner.address, addr2.address)
        })
    })

    describe('Safe Mint', function () {
        const tokenId = 1
        const uri = 'ipfs://example-uri'

        it('Should mint a token successfully for a family member', async function () {
            // Add addr1 as a family member
            await coatOfArms
                .connect(owner)
                .addMember(owner.address, addr1.address)

            // Add1 adds add2 as a family member

            await coatOfArms
                .connect(addr1)
                .addMember(addr1.address, addr2.address)

            // Mint token from addr1 to addr2
            await coatOfArms
                .connect(addr1)
                .safeMint(addr1.address, addr2.address, tokenId, uri)

            // Check if the token was minted successfully
            expect(await coatOfArms.ownerOf(tokenId)).to.equal(addr2.address)
            expect(await coatOfArms.tokenURI(tokenId)).to.equal(uri)
        })

        it('Should emit FamilyNFTMinted event when minting a token', async function () {
            // Add addr1 as a family member
            await coatOfArms
                .connect(owner)
                .addMember(owner.address, addr1.address)

            await coatOfArms
                .connect(addr1)
                .addMember(addr1.address, addr2.address)

            // Check if the FamilyNFTMinted event is emitted correctly
            await expect(
                coatOfArms
                    .connect(addr1)
                    .safeMint(addr1.address, addr2.address, tokenId, uri)
            )
                .to.emit(coatOfArms, 'FamilyNFTMinted')
                .withArgs(addr1.address, addr2.address, tokenId, uri)
        })

        it("Should fail if the sender doesn't have the FAMILY_ROLE", async function () {
            // Try to mint a token for addr2 who doesn't have the FAMILY_ROLE
            await expect(
                coatOfArms
                    .connect(addr1)
                    .safeMint(addr1.address, addr2.address, tokenId, uri)
            ).to.be.revertedWith(
                'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x777f19d45b942061992d93d9fb97a894ca03ce0b66452ad147c73cdd7433b7dc'
            )
        })
        it("Should fail if the recipient doesn't have the FAMILY_ROLE", async function () {
            // Add addr1 as a family member
            await coatOfArms
                .connect(owner)
                .addMember(owner.address, addr1.address)

            // Try to mint a token for addr2 who doesn't have the FAMILY_ROLE
            await expect(
                coatOfArms
                    .connect(addr1)
                    .safeMint(addr1.address, addr2.address, tokenId, uri)
            ).to.be.revertedWith('CoatOfArms: Address is not a family member')
        })
    })

    describe('Family Members and NFTs Count', function () {
        it('Should return correct family members count after adding a new member', async function () {
            await coatOfArms
                .connect(owner)
                .addMember(owner.address, addr1.address)

            const familyMembersCount = await coatOfArms.getFamilyMembersCount()
            expect(familyMembersCount).to.equal(2)
        })

        it('Should return correct family NFTs count after minting a new token', async function () {
            await coatOfArms.addMember(owner.address, addr1.address)
            await coatOfArms
                .connect(owner)
                .safeMint(
                    owner.address,
                    addr1.address,
                    1,
                    'https://example.com/token/1'
                )
            expect(await coatOfArms.getFamilyNFTsCount()).to.equal(1)
        })
    })
})
