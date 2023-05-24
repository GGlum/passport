// ---- Test subject
import { RequestPayload } from "@gitcoin/passport-types";
import axios from "axios";
import { HypercertsProvider } from "../Hypercerts";

// ----- Libs
const mockedAxiosPost = jest.spyOn(axios, "post");

const MOCK_ADDRESS = "0xcF314CE817E25b4F784bC1f24c9A79A525fEC50f";
const MOCK_ADDRESS_LOWER = MOCK_ADDRESS.toLowerCase();

// Mock Claim Tokens Response
const mockClaimTokensResponse = {
  data: {
    data: {
      claimTokens: [
        {
          id: "1",
          owner: MOCK_ADDRESS_LOWER,
          tokenID: "1",
          units: "100",
          claim: {
            id: "1",
            creation: "1632189184",
            uri: "https://hypercerts.com/token/1",
            totalUnits: "1000",
          },
        },
      ],
    },
  },
};

describe("Hypercerts Provider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxiosPost.mockResolvedValue(mockClaimTokensResponse);
  });

  it("should verify address with valid claims", async () => {
    const hypercertsProvider = new HypercertsProvider();
    const verifiedPayload = await hypercertsProvider.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    expect(verifiedPayload).toEqual({
      valid: true,
      record: {
        address: MOCK_ADDRESS_LOWER,
      },
    });

    expect(mockedAxiosPost).toBeCalledTimes(1);
  });

  it("should handle invalid claims", async () => {
    mockedAxiosPost.mockResolvedValueOnce({
      data: {
        data: {
          claimTokens: [],
        },
      },
    });

    const hypercertsProvider = new HypercertsProvider();
    const verifiedPayload = await hypercertsProvider.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    expect(verifiedPayload).toEqual({
      valid: false,
      record: {
        address: MOCK_ADDRESS_LOWER,
      },
    });

    expect(mockedAxiosPost).toBeCalledTimes(1);
  });

  it("should handle errors properly", async () => {
    const mockErrorMessage = "Something went wrong!";
    mockedAxiosPost.mockRejectedValueOnce({ status: 400, data: { error: { message: mockErrorMessage } } });

    const hypercertsProvider = new HypercertsProvider();

    const res = await hypercertsProvider.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    expect(res).toMatchObject({
      valid: false,
      error: ["Self Staking Gold Provider verifyStake Error"],
    });

    expect(mockedAxiosPost).toBeCalledTimes(1);
  });
});