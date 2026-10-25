import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as a}from"./index.DLkBFFtG.js";import{c as s}from"./createLucideIcon.BpezYcaV.js";/**
 * @license lucide-react v1.61.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]};n.node;const i=s(n);/**
 * @license lucide-react v1.61.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]};c.node;const l=s(c);function u(){const[e,o]=a.useState("light");return a.useEffect(()=>{const m=localStorage.getItem("promptaveron-theme"),d=window.matchMedia("(prefers-color-scheme: dark)").matches,r=m??(d?"dark":"light");o(r),document.documentElement.classList.toggle("dark",r==="dark")},[]),a.useEffect(()=>{document.documentElement.classList.toggle("dark",e==="dark"),localStorage.setItem("promptaveron-theme",e)},[e]),t.jsx("button",{type:"button","aria-label":"Toggle color theme",onClick:()=>o(e==="dark"?"light":"dark"),className:"inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--primary)]",children:e==="dark"?t.jsx(l,{className:"h-4 w-4"}):t.jsx(i,{className:"h-4 w-4"})})}export{u as ThemeToggle};
