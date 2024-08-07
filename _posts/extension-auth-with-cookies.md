---
title: "Enhancing Security and User Experience: Why Browser Extensions Should Have an Associated Website"
description: Discover why managing user onboarding, account management, and subscriptions from a separate website can enhance the security and user experience of your browser extension.
publishedAt: "2023-12-04"
updatedAt: "2023-12-04"
author: "Oisín Thomas"
image: "/profile.png"
majorTag: "Tinkering"
subTag: "Tech"
language: "en"
available: true
source: ""
tags:
  - Web Development
  - React
  - Browser Extension
  - Plasmo
---

Browser extensions have a bad reputation for security and safety, from both the users' and developer's perspective. There are critical aspects of a user experience—particularly account management and payments—that you can do on an extension, but if you really care about the experience and safety of your end user, you won't. Instead, you should do it using a separate webpage. In this article, I will discuss why and how you should manage your user onboarding, account management and subscriptions from a website associated with your extension.

### What Framework should I use?

Extensions have been seen as the Wild West of Product Development. Most extensions are developed in some JavaScript framework: svelt, Nextjs, etc., or even vanilla js with no dedicated environment or framework until recently. [Plasmo](https://www.plasmo.com/) is a new framework for extension development that promises cross-browser support along with environment testing and CI/CD, and for anyone who wants to dive into the world of extensions, I'd highly recommend starting here. There is a vibrant community on discord and the main framework is constantly expanding, yet it very stable for most browsers (it is great with chromium-based browsers and Firefox—but Safari is still buggy).

Additionally, Plasmo provide some great features out of the box including import management, messengers, storage API, extension pages and tab pages and a content-script UI functionality in which you can use React (and not have to fudge around with the vanilla trio of html-css-js).

### What are the Problems?

Google Chrome has made efforts to make the landscape of chrome extensions more safe through the update from Manifest Version 2 to 3, but a lot of things still fall short or simply obfuscate the development and impact negatively the user experience. These issues become even more prominent when you are developing a cross-browser extension. Added to this, the community for extension developers has been rather isolated and under-developed.

#### Cross-origin resource sharing (CORS)

You have the eternal problems of CORS. CORS is a protocol that decides whether a cross-origin request (e.g. a request from [https://adomain.com](https://anotherdomain.com/) to [https://otherdomain.com](https://otherdomain.com/)) should be allowed.

#### Content Security Policy (CSP)

CSP is layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting ([XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting)) and data injection attacks. These attacks are used for everything from data theft, to site defacement, to malware distribution.

You face these depending on where you are fetching data:
<table>
    <thead>
        <tr>
            <th>Origin</th>
            <th>CSP</th>
            <th>Cors</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Extension Pages</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>Background Script Worker</td>
            <td></td>
            <td>✔️</td>
            <td></td>
        </tr>
        <tr>
            <td>Content Script</td>
            <td>✔️</td>
            <td>✔️</td>
            <td></td>
        </tr>
    </tbody>
</table>




\*this does not include CORS issues you run into from the server side

#### Remote Code Execution

Due to [Manifest v3's restriction with remote code execution](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#remotely-hosted-code), all code executed by the extension must be present in the extension’s package uploaded to the webstore and server communication that could potentially changing extension behaviour will still be allowed. This means there are limited options to have integrations like Stripe, Hotjar etc. whereby a script is called in at runtime.

### What They Don't Tell You Explicitly

All of this put together means that:

- extension analytics and logging don't give you the same access to information. For example, you won't be able to have heatmaps etc of users going through an onboarding flow.
- using third party auth providers is out of the question because you don't have a backend for redirects, and popups are injected onto the page (which violates CSP).
- having a PCI-compliant payment system, like Stripe or Paddle, integrated into an extension is awkward... at best you can use Payment Links in Stripe—which doesn't give you the same granularity of control as managing the whole checkout experience does.

All of these issues are solved problems and perfectly workable from a website though. After looking at some of the most successful consumer browser extensions, we see this being used in Grammarly and Toucan. Therefore, I suggest a system where the extension communicates with a website that manages auth, account and subscription management via cookies.

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  }}
>
  <Image
    src="/Backend for Chrome Extension.png"
    width="618"
    height="404"
    alt="Architecture of a Browser Extension with a Backend using a Website for Authentication"
    sizes="100vw"
  />
</div>

We can see that the website handles the authentication and stores cookies (JWT tokens) that can be used in the extension to verify the user and access their user data. This model is similar to the one suggested by Plasmo in collaboration with [PropelAuth](https://www.plasmo.com/blog/posts/chrome-extension-auth-boilerplate-propelauth)—whereby the authentication is handled by a website and the information is fed back to the extension, just without the price-tag.

### Check out the example :)

To illustrate this point simply, I have set up a project for a website and an extension that uses Supabase as a backend, and simply pass a user-id across from the website to the extension.


<iframe
          width={windowSize.width}
          height={windowSize.height}
          allow="autoplay"
          src="/extension_with_cookies.mp4"
          title="videolabone">
        </iframe>

[React + Supabase Website](https://github.com/OisinThomasMorrin/react-auth-with-supabase)

[Plasmo Extension](https://github.com/OisinThomasMorrin/cookie-auth) 

This example is without checking any user data, or validating tokens etc, but is a nice way to consolidate the idea of sharing the data in a secure way that can be seamless. Another point is that if your extension has a backend, it can be best to not house the database client directly in the extension and instead use tokens for validation, rate limiting and calling the data—you can never be too careful with people's data.

### Conclusions

I hope this article was useful for some developers in the extension space. Simply put, extensions are a great way to build a product that is accessible and easy to use, but there are some serious security issues that need to be addressed. Websites (since they are highly developed by a very active and large community) help address these issues and can be used to enhance the user experience of your extension. I had to go through a lot of these learnings from this through mistakes, as it is so difficult to find resources on the topic. If anyone has any suggestions, recommendations or critiques, I'd love to hear them; the space is new and vibrant and there is so much more to be done in terms of developing the frameworks and best practices that underpin browser extensions.

### Reading and Resources

- [Content Security Policy (CSP) - HTTP | MDN (mozilla.org)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Chrome Extension Authentication Boilerplate using PropelAuth (plasmo.com)](https://www.plasmo.com/blog/posts/chrome-extension-auth-boilerplate-propelauth)
- [Remotely-hosted code (google.com)](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ks--r5hDNQ0)
- [Overview - PropelAuth](https://docs.propelauth.com/overview)
- [React + Supabase Website](https://github.com/OisinThomasMorrin/react-auth-with-supabase)
- [Plasmo Extension](https://github.com/OisinThomasMorrin/cookie-auth)
