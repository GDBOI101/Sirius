import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import { v4 as uuid } from "uuid";
import Accounts from "../../../../models/Accounts";
import { getSeason } from "../../../../utils";
import log from "../../../../utils/log";
import { getProfile } from "../../utils/getProfile";

interface ProfileChange {
  changeType: string;
  itemId: string;
  quantity: number;
}

export default async function PurchaseCatalogEntry(
  accountId: string,
  profileId: string,
  rvn: number,
  req: any,
  res: any
) {
  try {
    const { currency, offerId, purchaseQuantity } = req.body;
    const userAgent = req.headers["user-agent"];
    const season = getSeason(userAgent);

    const shopPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "resources",
      "storefront",
      "shop.json"
    );

    const shop = JSON.parse(fs.readFileSync(shopPath, "utf-8"));

    const account = await Accounts.findOne({ accountId }).lean();

    const applyProfileChanges: Object[] = [];
    const notifications: any[] = [];
    const multiUpdate: any[] = [];

    if (!account) {
      return res.status(404).json({
        errorMessage: "Account not found.",
      });
    }

    const userProfiles = getProfile(account.accountId);

    if (currency === "MtxCurrency" && profileId === "common_core") {
      if (!offerId || offerId === null) {
        return res.status(400).json({
          errorCode: "errors.com.epicgames.fortnite.id_invalid",
          errorMessage: `Offer ID (${offerId}) not found.`,
          messageVars: undefined,
          numericErrorCode: 1040,
          originatingService: "any",
          intent: "prod",
          error_description: `Offer ID (${offerId}) not found.`,
          error: undefined,
        });
      }

      if (offerId.includes(":/")) {
        const id: string = offerId.split(":/")[1];
        let matchedStorefront: any = null;
        let isItemOwned: boolean = false;

        for (const storefront of shop.catalogItems.BRDailyStorefront) {
          if (storefront.id === id) {
            matchedStorefront = storefront;
          }
        }

        for (const storefront of shop.catalogItems.BRWeeklyStorefront) {
          if (storefront.id === id) {
            matchedStorefront = storefront;
          }
        }

        if (purchaseQuantity < 1) {
          return res.status(400).json({
            errorCode: "errors.com.epicgames.validation.validation_failed",
            errorMessage:
              "Validation Failed. 'purchaseQuantity' is less than 1.",
            messageVars: undefined,
            numericErrorCode: 1040,
            originatingService: "any",
            intent: "prod",
            error_description:
              "Validation Failed. 'purchaseQuantity' is less than 1.",
            error: undefined,
          });
        }

        if (!matchedStorefront) {
          return res.status(400).json({
            errorCode: "errors.com.epicgames.fortnite.invalid_item_id",
            errorMessage: "Failed to retrieve item from the current shop.",
            messageVars: undefined,
            numericErrorCode: 1040,
            originatingService: "any",
            intent: "prod",
            error_description: "Failed to retrieve item from the current shop.",
            error: undefined,
          });
        } else {
          for (const currentItem of account.items) {
            const isItemInProfile = userProfiles.profileChanges.some(
              (profileChange: any) =>
                profileChange.profile.items[currentItem.templateId]
            );

            const isItemIncluded = currentItem.templateId.includes(
              matchedStorefront.item
            );

            if (isItemInProfile && isItemIncluded) {
              isItemOwned = true;
              break;
            }
          }

          if (isItemOwned) {
            return res.status(400).json({
              errorCode: "errors.com.epicgames.offer.already_owned",
              errorMessage: "You have already bought this item before.",
              messageVars: undefined,
              numericErrorCode: 1040,
              originatingService: "any",
              intent: "prod",
              error_description: "You have already bought this item before.",
              error: undefined,
            });
          } else {
            const itemUUID = uuid();

            for (const item of matchedStorefront.item) {
              multiUpdate.push({
                changeType: "itemAdded",
                itemId: itemUUID,
                item: {
                  templateId: item.item,
                  attributes: {
                    favorite: false,
                    item_seen: false,
                    level: 1,
                    max_level_bonus: 0,
                    rnd_sel_cnt: 0,
                    variants: [],
                    xp: 0,
                  },
                  quantity: 1,
                },
              });

              notifications.push({
                itemType: item.item,
                itemGuid: itemUUID,
                itemProfile: "athena",
                quantity: 1,
              });
            }

            multiUpdate.push({
              changeType: "itemAdded",
              itemId: itemUUID,
              item: {
                templateId: matchedStorefront.item,
                attributes: {
                  favorite: false,
                  item_seen: false,
                  level: 1,
                  max_level_bonus: 0,
                  rnd_sel_cnt: 0,
                  variants: [],
                  xp: 0,
                },
                quantity: 1,
              },
            });

            notifications.push({
              itemType: matchedStorefront.item,
              itemGuid: itemUUID,
              itemProfile: "athena",
              quantity: 1,
            });

            account.vbucks -= matchedStorefront.price;

            applyProfileChanges.push({
              changeType: "itemQuantityChanged",
              itemId: "Currency:MtxPurchased",
              quantity: account.vbucks,
            });

            if (matchedStorefront.price > account.vbucks) {
              return res.status(400).json({
                errorCode: "errors.com.epicgames.currency.mtx.insufficient",
                errorMessage: `You can not afford this item (${matchedStorefront.price}).`,
                messageVars: undefined,
                numericErrorCode: 1040,
                originatingService: "any",
                intent: "prod",
                error_description: `You can not afford this item (${matchedStorefront.price}).`,
                error: undefined,
              });
            }
          }
        }
      } else {
        // TODO: Battle Pass
      }
    }

    if (applyProfileChanges.length > 0) {
      rvn += 1;
      account.RVN += 1;
      account.baseRevision += 1;

      Accounts.updateOne({ accountId }, { $set: { RVN: account.RVN } });
      Accounts.updateOne(
        { accountId },
        { $set: { baseRevision: account.baseRevision } }
      );
    }

    if (multiUpdate.length > 0) {
      rvn += 1;
    }

    res.json({
      profileRevision: account.profilerevision,
      profileId,
      profileChangesBaseRevision: account.baseRevision,
      profileChanges: applyProfileChanges,
      notifications: [
        {
          type: "CatalogPurchase",
          primary: true,
          lootResult: {
            items: notifications,
          },
        },
      ],
      profileCommandRevision: account.RVN,
      serverTime: DateTime.now().toISO(),
      multiUpdate: [
        {
          profileRevision: account.profilerevision,
          profileId: "athena",
          profileChangesBaseRevision: account.baseRevision,
          profileChanges: multiUpdate,
          profileCommandRevision: account.RVN,
        },
      ],
      response: 1,
    });

    if (applyProfileChanges.length > 0) {
      for (const profileChanges of applyProfileChanges) {
        const typedProfileChanges = profileChanges as ProfileChange;

        await Accounts.updateOne(
          { accountId },
          {
            $set: {
              vbucks: typedProfileChanges.quantity,
            },
          }
        );
      }

      for (const items of multiUpdate) {
        const { item } = items;

        const UserProfile = path.join(
          __dirname,
          "..",
          "..",
          "utils",
          "profiles",
          `profile-${accountId}.json`
        );

        if (userProfiles) {
          userProfiles.profileChanges[0].profile.items = {
            ...userProfiles.profileChanges[0].profile.items,
            [item.templateId]: {
              attributes: item.attributes,
              templateId: item.templateId,
            },
          };

          await Accounts.updateOne(
            { accountId },
            {
              $push: {
                items: item,
              },
            }
          );

          fs.writeFileSync(
            UserProfile,
            JSON.stringify(userProfiles, null, 2),
            "utf-8"
          );
        } else {
          log.error(
            `User profile not found for accountId: ${accountId}`,
            "PurchaseCatalogEntry"
          );
        }
      }
    }
  } catch (error) {
    log.error(`${error}`, "PurchaseCatalogEntry");
  }
}
