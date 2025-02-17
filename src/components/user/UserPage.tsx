import UserTopPanel from "./u_panels/UserTopPanel";
import UserHistoryPanel from "./u_panels/UserHistoryPanel";
import LazyPanel from "./LazyPanel";
import { getUser } from "@/src/db/users/get_user";
import { type Mode, type PanelType } from "../../types/osu";
import Panel from "./Panel";
import UserSetupPanel from "./u_panels/UserSetupPanel";
import Title from "../web/Title";
import UserMedalsPanel from "./u_panels/UserMedalsPanel";

type Props = {
    logged_id: number | undefined;
    user_id: string;
    mode?: Mode;
    t: any
}

const UserPage = async (p: Props) => {

    const user = await getUser(p.user_id, p.mode);

    const no_chosen_mode = p.mode === undefined;

    if (!user || (user as any).error) return <div>User not found</div>;

    const editable = p.logged_id === user.id;

    p.mode = user.rank_history?.mode as Mode || "osu";

    const panels: PanelType[] = [
        {
            title: p.t.user.sections.history.title,
            code: "history",
            icon: <i class="fa-solid fa-chart-line" />,
            show_if: true,
            jsx: (
                <UserHistoryPanel
                    db_ranks={user.db_ranks}
                    play_counts={user.monthly_playcounts}
                    replays_watched={user.replays_watched_counts}
                />
            )
        },
        {
            title: p.t.user.sections.about,
            code: "about",
            icon: <i class="fa-solid fa-user" />,
            show_if: user.page?.html !== undefined,
            jsx: (
                <div class="rounded-lg bg-base-300 flex justify-center items-center">
                    {user.page.html ?
                        <div class="bbcode h-96 overflow-y-scroll grow">
                            {
                                user.page.html
                            }
                        </div> : <></>
                    }
                </div>
            )
        },
        {
            title: p.t.user.sections.setup.title,
            code: "setup",
            icon: <i class="fa-solid fa-computer" />,
            show_if: editable || user.db_setup !== undefined,
            manual: true,
            jsx: (<UserSetupPanel setup={user.db_setup} page_id={user.id} logged_id={p.logged_id} />)
        },
        // {
        //     title: "Skins",
        //     code: "skins",
        //     tooltip: "powered by skins.osuck.net",
        //     icon: <i class="fa-solid fa-palette" />,
        //     url: `/users/${user.id}/0/panels/skins`
        // },
        {
            title: p.t.user.sections.year.title,
            code: "year",
            info: p.t.user.sections.year.info,
            tooltip: "powered by advance.catboy.best",
            icon: <i class="fa-solid fa-calendar-days" />,
            url: `/users/${user.id}/0/panels/year`,
            manual: true,
            show_if: true,
        },
        {
            title: p.t.user.sections.summary.title,
            code: "summary",
            icon: <i class="fa-solid fa-ranking-star" />,
            info: p.t.user.sections.summary.info,
            url: `/users/${user.id}/${p.mode}/panels/summary`,
            manual: true,
            show_if: true,
        },
        {
            title: p.t.user.sections.scores.title,
            code: "scores",
            icon: <i class="fa-solid fa-flag-checkered" />,
            info: p.t.user.sections.scores.info,
            url: `/users/${user.id}/${p.mode}/panels/scores/best`,
            show_if: true
        },
        {
            title: p.t.user.sections.collections.title,
            code: "collections",
            tooltip: "powered by catboy.best",
            info: p.t.user.sections.collections.info,
            icon: <i class="fa-solid fa-list" />,
            url: `/users/${user.id}/${p.mode}/panels/collections`,
            manual: true,
            show_if: editable || (user.collections !== undefined && user.collections.length > 0)
        },
        {
            title: p.t.user.sections.beatmaps,
            code: "beatmapsets",
            icon: <i class="fa-solid fa-screwdriver-wrench" />,
            url: `/users/${user.id}/${p.mode}/panels/beatmapsets/favourite`,
            show_if: true
        },
        {
            title: p.t.user.sections.most,
            code: "most",
            icon: <i class="fa-solid fa-rotate-left" />,
            url: `/users/${user.id}/0/panels/most`,
            manual: true,
            show_if: true,
        },
        {
            title: p.t.user.sections.medals.title,
            code: "medals",
            tooltip: "powered by osekai.net",
            icon: <img src="/public/img/osekai.svg" class="w-5 h-5" alt="osekai" loading="lazy" />,
            // url: `/users/${user.id}/0/panels/medals`,
            show_if: user.user_achievements.length > 0,
            jsx: (<UserMedalsPanel t={p.t} user_id={user.id} medals={user.user_achievements} />)
        }
    ];

    return (<>
        <Title title={user.username} />
        <UserTopPanel t={p.t} user={user} mode={p.mode} editable={editable} />
        <nav class="underline-offset-1 text-neutral-content sticky -mt-8 top-16 bg-base-300 md:rounded-lg shadow-lg p-2 z-40 flex items-center justify-center flex-row gap-6 flex-wrap">
            <a class="hover:underline" href="#top">{p.t.user.sections.top}</a>
            {panels.map((p) => {
                if (!p.show_if) return <></>;
                return <a class="hover:underline" href={`#${p.code}`}>{p.title}</a>
            })}
        </nav>
        {panels.map((panel) => {
            if (!panel.show_if) return <></>;
            if (panel.url) return (
                <LazyPanel t={p.t} title={panel.title} code={panel.code} icon={panel.icon} manual={panel.manual}
                    url={panel.url} body={panel.body} tooltip={panel.tooltip} info={panel.info} />
            );
            else return (
                <Panel t={p.t} title={panel.title} code={panel.code} icon={panel.icon} tooltip={panel.tooltip} info={panel.info} manual={panel.manual}>
                    {panel.jsx}
                </Panel>
            );
        })}
        <script>{`
            history.replaceState({}, null, '/users/${user.id}${no_chosen_mode ? "" : `/${p.mode}`}');
            getUserStuff();
        `}</script>
    </>);
}

export default UserPage;
