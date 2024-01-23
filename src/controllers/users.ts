import { v2 } from "osu-api-extended";
import { Mode, ModeRanks, Rank, User } from "../models/user";
import { response as v2User } from "osu-api-extended/dist/types/v2_user_details";
import { response as v2UserList } from "osu-api-extended/dist/types/v2_site_ranking_details";

export type UserResponse = v2User & { db_info: ModeRanks };

export async function getUser(id: number | string, mode: Mode = "osu"): Promise<UserResponse | null> {
    const user: v2User = await v2.user.details(id, mode);
    if (!user) return null;
    const new_user: UserResponse = {
        ...user, db_info: await updateUser(
            user.id, 
            user.username, 
            user.rank_history.data, 
            user.statistics.country_rank, 
            user.rank_history.mode as Mode 
        )
    };
    return new_user;
}

async function updateUser(user_id: number, username: string, global_ranks: number[], country_rank: number, mode: Mode = "osu"): Promise<ModeRanks> {
    let res: ModeRanks = { global_ranks: [] as any, country_ranks: [] as any };
    if (!country_rank) return res;
    const today: Date = new Date()
    today.setHours(0, 0, 0, 0);

    const new_country_ranks: Rank[] = [{rank: country_rank, date: today}];
    const new_global_ranks: Rank[] = global_ranks.map((rank, i) => ({rank, date: new Date(today as any - i)}));

    let user = await User.findOne({user_id});
    if (user) {
        user.username = username;
        if (!user.modes) user.modes = {};
        if (!user.modes[mode]) user.modes[mode] = {global_ranks: [] as any, country_ranks: [] as any};
        (user.modes[mode] as any).global_ranks = filter_ranks((user.modes[mode] as any).global_ranks, new_global_ranks);
        (user.modes[mode] as any).country_ranks = filter_ranks((user.modes[mode] as any).country_ranks, new_country_ranks);
        res = user.modes[mode] as any; 
    } else {
        user = new User({
            user_id,
            username,
            modes: {[mode]: {
                global_ranks: new_global_ranks,
                country_ranks: new_country_ranks
            }}
        });
        res = user.modes?.[mode] as any; 
    }
    user.save();
    return res;
}

function filter_ranks(olds: Rank[], news: Rank[]): Rank[] {
    return news.filter(new_rank => !olds.find(
        old_rank => old_rank.date === new_rank.date
    ));
}

export async function searchUser(username: string) {
    return await v2.site.search({
        mode: "user",
        query: username,
        page: 0,
    });
}

export async function getUsers(mode: Mode = "osu", page: number = 0, type: "performance" | "score" = "performance") {
    const res: v2UserList = await v2.site.ranking.details(
        mode, type, {
            cursor: { page },
            filter: "all",
        } as any
    );
    return res;
}
