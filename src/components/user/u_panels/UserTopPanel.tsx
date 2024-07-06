import moment from "moment";
import BarChart from "./u_components/BarChart";
import Flag from "./u_components/Flag";
import Country from "./u_components/Country";
import Supporter from "./u_components/Supporter";
import ModeIcon from "../../beatmap/ModeIcon";
import type { User } from "@/src/types/users";
import type { Mode } from "@/src/types/osu";
import { colors } from "@/src/libs/colors";
import SubdivisionFlag from "./u_components/SubdivisionFlag";
import Link from "../../web/Link";
import Clan from "./u_components/Clan";
import SubdivisionRanking from "./u_components/SubdivisionRanking";

type Props = {
    user: User,
    mode: Mode,
}

async function UserTopPanel({ user, mode }: Props) {

    if (!user) return <></>;

    const best_country = user?.db_ranks?.country_ranks?.sort?.((a, b) => a.rank - b.rank)[0];
    const grade_counts = new Map<string, { count: number, color: string }>();

    grade_counts.set("XH", { count: user.statistics.grade_counts.ssh, color: colors.grades.xh });
    grade_counts.set("X", { count: user.statistics.grade_counts.ss, color: colors.grades.x });
    grade_counts.set("SH", { count: user.statistics.grade_counts.sh, color: colors.grades.sh });
    grade_counts.set("S", { count: user.statistics.grade_counts.s, color: colors.grades.s });
    grade_counts.set("A", { count: user.statistics.grade_counts.a, color: colors.grades.a });

    const joined_date = moment(user.join_date).format("DD/MM/YYYY");

    return (
        <section class="pb-4 bg-base-300 md:rounded-lg shadow-lg">
            <div class="rounded-lg"
                style={{
                    backgroundImage: `url(${user.cover_url})`,
                    backgroundSize: `cover`,
                    backgroundPosition: `center`,
                    backgroundRepeat: "no-repeat"
                }}>
                <div class="text-base-content bg-base-300 bg-opacity-65 backdrop-blur-sm justify-center flex flex-row flex-wrap gap-4 p-4 rounded-lg">
                    <div class="flex flex-col gap-4 justify-between w-40">
                        <img src={user.avatar_url} class="rounded-lg aspect-square" alt={`${user.username}'s pfp`} />
                        <div class="bg-base-300 rounded-lg flex flex-row gap-2 p-2 flex-wrap justify-around items-center">
                            <div class="tooltip" data-tip="osu!">
                                {mode === "osu" ?
                                    <ModeIcon mode="osu" size={24} css={`fill-secondary`} /> :
                                    <Link url={`/users/${user.id}/osu`} label="standard mode">
                                        <ModeIcon mode="osu" size={24} css={`fill-base-content`} />
                                    </Link>
                                }
                            </div>
                            <div class="tooltip" data-tip="osu!taiko">
                                {mode === "taiko" ?
                                    <ModeIcon mode="taiko" size={24} css={`fill-secondary`} /> :
                                    <Link url={`/users/${user.id}/taiko`} label="taiko mode">
                                        <ModeIcon mode="taiko" size={24} css={`fill-base-content`} />
                                    </Link>
                                }
                            </div>
                            <div class="tooltip" data-tip="osu!catch">
                                {mode === "fruits" ?
                                    <ModeIcon mode="fruits" size={24} css={`fill-secondary`} /> :
                                    <Link url={`/users/${user.id}/fruits`} label="fruits mode">
                                        <ModeIcon mode="fruits" size={24} css={`fill-base-content`} />
                                    </Link>
                                }
                            </div>
                            <div class="tooltip" data-tip="osu!mania">
                                {mode === "mania" ?
                                    <ModeIcon mode="mania" size={24} css={`fill-secondary`} /> :
                                    <Link url={`/users/${user.id}/mania`} label="mainia mode">
                                        <ModeIcon mode="mania" size={24} css={`fill-base-content`} />
                                    </Link>
                                }
                            </div>
                        </div>
                        <span class="text-center">joined <time class="tooltip" data-tip={joined_date} datetime={joined_date}>{moment(user.join_date).fromNow()}</time></span>
                        <div class="flex flex-row justify-between gap-2 items-center">
                            <span>{user.statistics.level.current}</span>
                            <progress class="progress progress-accent w-32" value={user.statistics.level.progress} max="100" />
                            <span>{user.statistics.level.current + 1}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 justify-between items-start grow">
                        <div class="flex flex-row gap-2 items-center">
                            <Clan user_id={user.id} />
                            <a href={`https://osu.ppy.sh/users/${user.id}`} target="_blank" class="text-2xl underline-offset-2 hover:underline">
                                {user.username}
                            </a>
                            {user.is_supporter &&
                                <Supporter level={user.support_level} />
                            }
                            {user.groups.map(g =>
                                <div class="badge text-white p-1 flex flex-row" style={{
                                    backgroundColor: g.colour,
                                    gap: ".08rem",
                                }}>
                                    {g.short_name}
                                </div>
                            )}
                        </div>
                        {user.title ?
                            <div class="bg-gradient-to-r from-blue-600 to-green-400 inline-block text-transparent bg-clip-text">
                                {user.title}
                            </div> : <></>}
                        <div class="flex flex-row gap-2 items-center">
                            <i class="fa-solid fa-earth-americas fa-xl"></i>
                            <h2 class="text-xl tooltip" data-tip={`Peak rank: #${user?.rank_highest?.rank?.toLocaleString?.()}`}>
                                #{user.statistics?.global_rank?.toLocaleString() || "-"}
                            </h2>
                        </div>
                        <div class="flex flex-row gap-2 items-center">
                            {(user.country as any).cat ?
                                <Country code={"CAT"} name={"Catalunya"} /> :
                                <Country code={user.country.code} name={user.country.name} />
                            }
                            <h2 class="text-xl tooltip" data-tip={`Peak rank: #${best_country?.rank?.toLocaleString()}`}>
                                #{user.statistics?.country_rank?.toLocaleString() || "-"}
                            </h2>
                            <Flag name={user.country.name} code={user.country.code} />
                        </div>
                        <div class="hidden group flex-row gap-2 items-center">
                            <i class="hidden group-has[.flex]:flex w-6 fa-solid fa-city"></i>
                            <SubdivisionRanking user_id={user.id} mode={mode} />
                            <SubdivisionFlag user_id={user.id} />
                        </div>
                        <dl class="flex flex-col gap-1">
                            <div>
                                <dt class="text-sm">Performance:</dt>
                                <dd class="text-lg">{Math.round(user.statistics.pp).toLocaleString()}pp</dd>
                            </div>
                            <div>
                                <dt class="text-sm">Accuracy:</dt>
                                <dd class="text-lg">{(user.statistics.hit_accuracy).toFixed(2)}%</dd>
                            </div>
                            <div>
                                <dt class="text-sm">Medals:</dt>
                                <dd class="text-lg">{user.user_achievements.length} <i class="fa-solid fa-medal fa-xs"></i></dd>
                            </div>
                        </dl>
                    </div>
                    <div class="flex flex-col gap-4 justify-between grow">
                        <table>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-angles-up w-4 text-center" /></th>
                                <td class="p-1">Ranked Score:</td>
                                <td class="p-1 text-end">{user.statistics.ranked_score.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-arrow-rotate-left w-4 text-center" /></th>
                                <td class="p-1">Play Count:</td>
                                <td class="p-1 text-end">{user.statistics.play_count.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-regular fa-clock w-4 text-center" /></th>
                                <td class="p-1">Play Time:</td>
                                <td class="p-1 text-end">{Math.floor(user.statistics.play_time / 60 / 60).toLocaleString()}h</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-fire w-4 text-center" /></th>
                                <td class="p-1">Max Combo:</td>
                                <td class="p-1 text-end">{user.statistics.maximum_combo.toLocaleString()}x</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-keyboard w-4 text-center" /></th>
                                <td class="p-1">Total Hits:</td>
                                <td class="p-1 text-end">{user.statistics.total_hits.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-calculator w-4 text-center" /></th>
                                <td class="p-1">Hits x Play:</td>
                                <td class="p-1 text-end">{Math.round(user.statistics.total_hits / user.statistics.play_count || 0).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th class="p-1"><i class="fa-solid fa-eye w-4 text-center" /></th>
                                <td class="p-1">Replays Watched:</td>
                                <td class="p-1 text-end">{user.statistics.replays_watched_by_others.toLocaleString()}</td>
                            </tr>
                        </table>
                        <div class="flex flex-row gap-4 items-center justify-end">
                            <BarChart name="total_grades" data={grade_counts} user={{
                                user_id: user.id,
                                username: user.username,
                                mode: mode === "taiko" ? 1 : mode === "fruits" ? 2 : mode === "mania" ? 3 : 0
                            }} />
                            <span id="total_grades_loading" class="hidden loading loading-spinner loading-md" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-base-100 flex flex-col gap-4 p-4">
                <div class="flex flex-row items-center flex-wrap gap-4">
                    {user.location ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-solid fa-location-dot" />
                            <span>{user.location}</span>
                        </div>
                        : <></>
                    }
                    {user.interests ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-solid fa-heart" />
                            <span>{user.interests}</span>
                        </div>
                        : <></>
                    }
                    {user.occupation ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-solid fa-building" />
                            <span>{user.occupation}</span>
                        </div>
                        : <></>
                    }
                    {user.twitter ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-brands fa-twitter" />
                            <a href={`https://twitter.com/${user.twitter}`} target="_blank" class="hover:underline">
                                {user.twitter}
                            </a>
                        </div>
                        : <></>
                    }
                    {user.discord ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-brands fa-discord" />
                            <span>{user.discord}</span>
                        </div>
                        : <></>
                    }
                    {user.website ?
                        <div class="flex flex-row items-center gap-1">
                            <i class="fa-solid fa-globe"></i>
                            <a href={user.website} target="_blank" class="hover:underline">{user.website}</a>
                        </div>
                        : <></>
                    }
                </div>
                {user.badges.length > 0 &&
                    <div class="flex flex-row flex-wrap gap-2">
                        {user.badges.map(badge =>
                            <div class="tooltip" data-tip={badge.description}>
                                <img loading="lazy" width="86" height="40" alt={badge.description} src={badge.image_url} />
                            </div>
                        )}
                    </div>
                }
            </div>
        </section>
    );
}

export default UserTopPanel;
