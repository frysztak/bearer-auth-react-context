"use strict";(self.webpackChunkreact_bearer_auth_context=self.webpackChunkreact_bearer_auth_context||[]).push([[786],{2766:function(e,n,r){r.r(n),r.d(n,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return d},toc:function(){return h},default:function(){return u}});var t=r(7462),a=r(3366),o=(r(7294),r(3905)),s=["components"],i={id:"handling-refresh",custom_edit_url:null,sidebar_label:"Handling Refresh",slug:"/handling-refresh"},l="Handling Token Refresh",d={unversionedId:"handling-refresh",id:"handling-refresh",isDocsHomePage:!1,title:"Handling Token Refresh",description:"For the library to automatically obtain fresh Bearer token, two properties need to be provided:",source:"@site/docs/handling-refresh.mdx",sourceDirName:".",slug:"/handling-refresh",permalink:"/bearer-auth-react-context/handling-refresh",editUrl:null,tags:[],version:"current",frontMatter:{id:"handling-refresh",custom_edit_url:null,sidebar_label:"Handling Refresh",slug:"/handling-refresh"},sidebar:"sidebar",previous:{title:"Getting Started",permalink:"/bearer-auth-react-context/"},next:{title:"Making Network Calls",permalink:"/bearer-auth-react-context/network-calls"}},h=[{value:"<code>hasTokenExpired</code>",id:"hastokenexpired",children:[]},{value:"<code>refreshHandler</code>",id:"refreshhandler",children:[]}],c={toc:h};function u(e){var n=e.components,r=(0,a.Z)(e,s);return(0,o.kt)("wrapper",(0,t.Z)({},c,r,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"handling-token-refresh"},"Handling Token Refresh"),(0,o.kt)("p",null,"For the library to automatically obtain fresh Bearer token, two properties need to be provided:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"type hasTokenExpired = (error: any) => boolean;\n")),(0,o.kt)("p",null,"and"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"type refreshHandler = RefreshHandler<FetcherConfig>;\n\ntype RefreshHandler<FetcherConfig extends Tokens> = (\n  fetcherConfig: FetcherConfig\n) => Promise<Tokens>;\n")),(0,o.kt)("h3",{id:"hastokenexpired"},(0,o.kt)("inlineCode",{parentName:"h3"},"hasTokenExpired")),(0,o.kt)("p",null,"This function is called whenever a request fails. Sample implementation:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"export function hasTokenExpired(apiError: ApiError): boolean {\n  if (apiError instanceof Error) {\n    return false;\n  }\n  const { body } = apiError;\n  return 'message' in body && body.message === 'Unauthorized';\n}\n")),(0,o.kt)("h3",{id:"refreshhandler"},(0,o.kt)("inlineCode",{parentName:"h3"},"refreshHandler")),(0,o.kt)("p",null,"If request failed because of expired Bearer token, ",(0,o.kt)("inlineCode",{parentName:"p"},"refreshHandler")," is called to refresh the token. Sample implementation:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"export const handleTokenRefresh: RefreshHandler<FetchConfig> = (\n  fetcherConfig\n): Promise<Tokens> => {\n  return new Promise<Tokens>(async (resolve, reject) => {\n    try {\n      const newTokens: AuthenticateResponse = await postUsersRefreshToken(\n        fetcherConfig\n      )();\n\n      resolve({\n        bearerToken: newTokens.jwtToken,\n      });\n    } catch (e) {\n      reject(e);\n    }\n  });\n};\n")))}u.isMDXComponent=!0}}]);