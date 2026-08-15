# Favicon Creator

## Introduction

Create a favicon for your website in seconds

Download on the Chrome Store: https://chrome.google.com/webstore/detail/favicon-creator/edaanjknhmgcohcddbhpjfhganbmggka

## How it works

FaviconCreator allows you to create a favicon using simple inputs, and selection options. It:

- Allows you to have a FontAwesome icon or text as your main visual.
- Gives you the ability to change the color and background color.
- Provides options for which image sizes you which to download.
- Provides options for which file type to download.
- Provides HTML code for your projects.

## How to use your favicons

After you download your zip from Favicon Creator:

1. Unzip `favicon-creator.zip`.
2. Copy the files into your website. Keep the `images` folder as-is, and put the root files (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, Android Chrome icons, and `site.webmanifest`) next to your HTML, or in a public folder your site can reach.
3. Open `html.html` from the zip and paste its `<link>` tags into the `<head>` of your page.
4. Update the `href` paths if your files are not in the same places the snippet assumes.

A typical setup looks like this:

```html
<head>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="icon" href="favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="icon" sizes="16x16" type="image/png" href="images/favicon16x16.png">
  <link rel="icon" sizes="32x32" type="image/png" href="images/favicon32x32.png">
</head>
```

What each file is for:

- **PNG / JPG** sizes in `images/` — raster icons for browsers that request a specific size. Change `type` to `image/jpeg` if you downloaded JPG.
- **favicon.svg** — a sharp, scalable icon for modern browsers.
- **favicon.ico** — a fallback for older browsers and tools that still look for `/favicon.ico`.
- **apple-touch-icon.png** — the icon iOS uses when someone adds your site to their home screen.
- **site.webmanifest** plus the Android Chrome PNGs — used for installable / PWA-style icons. Edit the `name` and `short_name` in the manifest to match your site.

If a file is missing from your zip, you turned that option off on the download screen, so you can skip its `<link>` tag.

## Why?

This project aims to be a quick solution for many web developers across the world who may have
left their creative skills at home and need a favicon for their project ASAP.

It's also a way for me to give something small back to the community I love <3

## Credit & Thanks to

- FontAwesome4 : https://fontawesome.com/v4.7.0/
- JSZip : http://stuartk.com/jszip
- FileSaver : https://github.com/eligrey/FileSaver.js
