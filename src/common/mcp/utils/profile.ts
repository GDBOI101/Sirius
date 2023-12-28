import { DateTime } from "luxon";
import { AthenaData, PurchaseItem } from "../../../interface";
import { v4 as uuid } from "uuid";
import Accounts from "../../../models/Accounts";
import Users from "../../../models/Users";
import Athena, {
  XP,
  hasPurchasedBP,
  level,
} from "../operations/QueryProfile/Athena";

import fs from "node:fs";
import path from "node:path";
import log from "../../../utils/log";

let newProfileChange: AthenaData;

export async function AddProfileItem(
  athena: any,
  profileId: string,
  rvn: number,
  level: number,
  XP: number,
  season: string | number,
  hasPurchasedBP: boolean,
  isUpdated?: boolean,
  newData?: any
) {
  newProfileChange = {
    profileRevision: athena.profilerevision || 0,
    profileId,
    profileChangesBaseRevision: rvn || 0,
    profileChanges: [
      {
        changeType: "fullProfileUpdate",
        _id: uuid(),
        profile: {
          _id: uuid(),
          Update: "",
          Created: "2021-03-07T16:33:28.462Z",
          updated: "2021-05-20T14:57:29.907Z",
          rvn,
          wipeNumber: 1,
          accountId: athena.accountId,
          profileId,
          version: "no_version",
          items: {
            sandbox_loadout: {
              templateId: "CosmeticLocker:cosmeticlocker_athena",
              attributes: {
                locker_slots_data: {
                  slots: {
                    MusicPack: { items: [athena.musicpack.items] },
                    Character: {
                      items: [athena.character.items],
                      activeVariants: athena.character.activeVariants,
                    },
                    Backpack: {
                      items: [athena.backpack.items],
                      activeVariants: [athena.backpack.activeVariants],
                    },
                    SkyDiveContrail: {
                      items: [athena.skydivecontrail.items],
                      activeVariants: [athena.skydivecontrail.activeVariants],
                    },
                    Dance: { items: athena.dance.items },
                    LoadingScreen: { items: [athena.loadingscreen.items] },
                    Pickaxe: {
                      items: [athena.pickaxe.items],
                      activeVariants: [athena.pickaxe.activeVariants],
                    },
                    Glider: {
                      items: [athena.glider.items],
                      activeVariants: [athena.glider.activeVariants],
                    },
                    ItemWrap: {
                      items: athena.itemwrap.items,
                      activeVariants: [athena.itemwrap.activeVariants],
                    },
                  },
                },
                use_count: 0,
                banner_icon_template: athena.Banner.banner_icon,
                banner_color_template: athena.Banner.banner_color,
                locker_name: "",
                item_seen: false,
                favorite: false,
              },
              quantity: 1,
            },
            loadout_1: {
              templateId: "CosmeticLocker:cosmeticlocker_athena",
              attributes: {
                locker_slots_data: {
                  slots: {
                    MusicPack: { items: [athena.musicpack.items] },
                    Character: {
                      items: [athena.character.items],
                      activeVariants: athena.character.activeVariants,
                    },
                    Backpack: {
                      items: [athena.backpack.items],
                      activeVariants: [athena.backpack.activeVariants],
                    },
                    SkyDiveContrail: {
                      items: [athena.skydivecontrail.items],
                      activeVariants: [athena.skydivecontrail.activeVariants],
                    },
                    Dance: { items: athena.dance.items },
                    LoadingScreen: { items: [athena.loadingscreen.items] },
                    Pickaxe: {
                      items: [athena.pickaxe.items],
                      activeVariants: [athena.pickaxe.activeVariants],
                    },
                    Glider: {
                      items: [athena.glider.items],
                      activeVariants: [athena.glider.activeVariants],
                    },
                    ItemWrap: {
                      items: athena.itemwrap.items,
                      activeVariants: [athena.itemwrap.activeVariants],
                    },
                  },
                },
                use_count: 0,
                banner_icon_template: athena.Banner.banner_icon,
                banner_color_template: athena.Banner.banner_color,
                locker_name: "Sirius",
                item_seen: false,
                favorite: false,
              },
              quantity: 1,
            },
            "AthenaPickaxe:DefaultPickaxe": {
              attributes: {
                favorite: false,
                item_seen: true,
                level: 0,
                max_level_bonus: 0,
                rnd_sel_cnt: 0,
                variants: [],
                xp: 0,
              },
              templateId: "AthenaPickaxe:DefaultPickaxe",
            },
            "AthenaGlider:DefaultGlider": {
              attributes: {
                favorite: false,
                item_seen: true,
                level: 0,
                max_level_bonus: 0,
                rnd_sel_cnt: 0,
                variants: [],
                xp: 0,
              },
              templateId: "AthenaGlider:DefaultGlider",
            },
            "AthenaDance:EID_DanceMoves": {
              attributes: {
                favorite: false,
                item_seen: true,
                level: 0,
                max_level_bonus: 0,
                rnd_sel_cnt: 0,
                variants: [],
                xp: 0,
              },
              templateId: "AthenaDance:EID_DanceMoves",
            },
          },
          stats: {
            attributes: {
              use_random_loadout: false,
              past_seasons: [],
              season_match_boost: 0,
              loadouts: ["sandbox_loadout", "loadout_1"],
              mfa_reward_claimed: true,
              rested_xp_overflow: 0,
              current_mtx_platform: "Epic",
              last_xp_interaction: "2022-12-10T22:14:37.647Z",
              quest_manager: {
                dailyLoginInterval: "0001-01-01T00:00:00.000Z",
                dailyQuestRerolls: 1,
              },
              book_level: level,
              season_num: season,
              book_xp: XP,
              creative_dynamic_xp: {},
              season: {
                numWins: 0,
                numHighBracket: 0,
                numLowBracket: 0,
              },
              vote_data: {},
              lifetime_wins: 0,
              book_purchased: hasPurchasedBP,
              rested_xp_exchange: 1,
              level,
              rested_xp: 2500,
              rested_xp_mult: 4.4,
              accountLevel: 1,
              rested_xp_cumulative: 52500,
              xp: XP,
              season_friend_match_boost: 0,
              active_loadout_index: 0,
              purchased_bp_offers: [],
              last_match_end_datetime: "",
              mtx_purchase_history_copy: [],
              last_applied_loadout: "sandbox_loadout",
              favorite_musicpack: athena.musicpack.items,
              banner_icon: athena.Banner.banner_icon,
              favorite_character: athena.character.items,
              favorite_itemwraps: athena.itemwrap.items,
              favorite_skydivecontrail: athena.skydivecontrail.items,
              favorite_pickaxe: athena.pickaxe.items,
              favorite_glider: athena.glider.items,
              favorite_backpack: athena.backpack.items,
              favorite_dance: athena.dance.items,
              favorite_loadingscreen: athena.loadingscreen.items,
              banner_color: athena.Banner.banner_color,
            },
          },
          commandRevision: 5,
        },
      },
    ],
    serverTime: DateTime.now().toISO(),
    profileCommandRevision: athena.profilerevision || 0,
    responseVersion: 1,
  };

  if (isUpdated) {
    const profilePath = path.join(
      __dirname,
      "..",
      "operations",
      "QueryProfile",
      "profile.json"
    );

    let existingData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));

    existingData.profileChanges[0].profile.items = {
      ...existingData.profileChanges[0].profile.items,
      ...newData,
    };

    fs.writeFileSync(profilePath, JSON.stringify(existingData, null, 2));

    return existingData;
  }

  return newProfileChange;
}

async function updateAthenaData(cosmeticTemplate: any): Promise<void> {
  const profileChange = newProfileChange.profileChanges[0];
  profileChange.profile.items = {
    ...profileChange.profile.items,
    ...cosmeticTemplate,
  };
}

export async function AddItem(
  item: PurchaseItem,
  accountId: string
): Promise<void> {
  const cosmeticTemplate = {
    [item.templateId]: {
      attributes: item.attributes,
      templateId: item.templateId,
    },
  };

  try {
    const [dbUpdateResult] = await Promise.all([
      Accounts.updateOne(
        { accountId },
        {
          $push: {
            items: item,
          },
        }
      ),
      updateAthenaData(cosmeticTemplate),
    ]);

    const [user, account] = await Promise.all([
      Users.findOne({ accountId }),
      Accounts.findOne({ accountId }),
    ]);

    if (!user || !account) return;

    await AddProfileItem(
      account,
      "athena",
      account.RVN,
      level,
      XP,
      account.Season[0].seasonNumber,
      hasPurchasedBP,
      true,
      cosmeticTemplate
    );

    Object.assign(newProfileChange, cosmeticTemplate);

    if (dbUpdateResult) {
      log.debug(
        `Successfully added ${item.templateId} to ${user.username}'s locker.`,
        "Profile"
      );
    } else {
      log.error(
        `Failed to add ${item.templateId} to ${user.username}'s locker.`,
        "Profile"
      );
    }
  } catch (error) {
    log.error(`Error during item addition: ${error}`, "Profile");
    throw error;
  }
}

export async function UpdateVbucks(quantity: number, accountId: string) {
  const [account] = await Promise.all([
    await Accounts.findOne({ accountId }).lean(),
  ]);

  if (!account) return;

  return await Accounts.updateOne(
    { accountId },
    {
      $set: {
        vbucks: quantity,
      },
    }
  );
}
