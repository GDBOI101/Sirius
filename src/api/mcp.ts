import { Router } from "express";
import { createDefaultResponse, getSeason, sendErrorResponse } from "../utils";
import Users from "../models/Users";
import Accounts from "../models/Accounts";
import ProfileAthena from "../common/mcp/operations/QueryProfile/Athena";
import ProfileCommonCore from "../common/mcp/operations/QueryProfile/CommonCore";
import SetCosmeticLockerSlot from "../common/mcp/operations/SetCosmeticLockerSlot/SetCosmeticLockerSlot";
import EquipBattleRoyaleCustomization from "../common/mcp/operations/EquipBattleRoyaleCustomization/EquipBattleRoyaleCustomization";
import log from "../utils/log";
import ClaimMfaEnabled from "../common/mcp/operations/ClaimMfaEnabled/ClaimMfaEnabled";
import MarkItemSeen from "../common/mcp/operations/MarkItemSeen/MarkItemSeen";
import ClientQuestLogin from "../common/mcp/operations/ClientQuestLogin/ClientQuestLogin";

export default function initRoute(router: Router): void {
  router.post(
    [
      "/fortnite/api/game/v2/profile/:accountId/*/EquipBattleRoyaleCustomization",
      "/fortnite/api/game/v2/profile/:accountId/*/SetCosmeticLockerSlot",
    ],
    async (req, res) => {
      try {
        const { accountId } = req.params;
        const {
          profileId,
          slotName,
          itemToSlot,
          indexWithinSlot,
          category,
          variantUpdates,
          rvn,
          slotIndex,
        } = req.body;

        if (req.body.slotName !== undefined) {
          return res.json(
            await EquipBattleRoyaleCustomization(
              accountId,
              slotName,
              itemToSlot,
              indexWithinSlot,
              variantUpdates,
              rvn
            )
          );
        } else {
          return res.json(
            await SetCosmeticLockerSlot(
              accountId,
              category,
              itemToSlot,
              slotIndex,
              rvn as any
            )
          );
        }
      } catch (error) {
        let err = error as Error;
        log.error(`Error updating profile: ${err.message}`, "MCP");
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  router.post(
    "/fortnite/api/game/v2/profile/:accountId/*/:command",
    async (req, res) => {
      const { accountId, command } = req.params;
      const { rvn, profileId } = req.query;
      const {
        slotName,
        itemToSlot,
        indexWithinSlot,
        category,
        variantUpdates,
        slotIndex,
      } = req.body;

      const userAgent = req.headers["user-agent"];
      let season = getSeason(userAgent);

      try {
        switch (command) {
          case "QueryProfile":
          case "SetHardcoreModifier":
            switch (profileId) {
              case "athena":
              case "profile0":
                const athenaProfile = await ProfileAthena(
                  Users,
                  Accounts,
                  accountId,
                  profileId,
                  false,
                  season?.season as number,
                  rvn
                );
                return res.json(athenaProfile);

              case "common_core":
              case "common_public":
                const commonCoreProfile = await ProfileCommonCore(
                  Accounts,
                  accountId,
                  profileId
                );
                return res.json(commonCoreProfile);

              default:
                return res.json(
                  createDefaultResponse([], profileId, (rvn as any) + 1)
                );
            }
            break;

          case "ClaimMfaEnabled":
            res
              .status(204)
              .json(await ClaimMfaEnabled(res, profileId as string, accountId));
            break;

          case "MarkItemSeen":
            res
              .status(204)
              .json(await MarkItemSeen(profileId as string, rvn as any, req));
            break;

          case "ClientQuestLogin":
            const result = await ClientQuestLogin(
              accountId,
              profileId as string,
              rvn as any,
              req
            );

            res.json(result).status(204);
            break;

          case "SetMtxPlatform":
            break;
        }
      } catch (error) {
        let err: Error = error as Error;
        log.error(`An error has occured: ${err.message}`, "MCP");

        res.json(createDefaultResponse([], profileId, (rvn as any) + 1 || 1));
      }
    }
  );
}
