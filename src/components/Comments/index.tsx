import { FC } from "react";
export const Comments: FC = () => {
    return (
        <section
            ref={(elem) => {
                if (!elem || elem.childNodes.length) {
                    return;
                }
                const scriptElem = document.createElement("script");
                scriptElem.src = "https://utteranc.es/client.js";
                scriptElem.async = true;
                scriptElem.crossOrigin = "anonymous";
                scriptElem.setAttribute("repo", "ricardo85x/desafio-05-criando-um-projeto-do-zero");
                scriptElem.setAttribute("issue-term", "pathname");
                scriptElem.setAttribute("label", "desafio5");
                scriptElem.setAttribute("theme", "github-dark");
                elem.appendChild(scriptElem);
            }}
        />
    )
}