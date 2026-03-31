const DISABLED_EPISODE_MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20" fill="none"><g clip-path="url(#a)"><path fill="#fff" d="M101.47.7Q99.415.505 97.36.46c-1.94-.07-3.88-.05-5.82.01-5.09.14-10.18.54-15.27.47-.17 0-.35 0-.52-.01-1.96-.02-3.91-.04-5.87-.05-10.47-.07-20.98-.53-31.4.54-9.09.94-15.84.86-23.62.6-4.38-.15-9.8-.22-14.18.02-.36.02-.66.31-.68.68-.03.4.28.75.68.77 3.65.23 7.26.05 10.91.09 4.75.06 9.54.29 14.29.34 8.4.03 16.8.3 25.2.64 8.4.26 16.79.02 25.19.03h.22c.31 0 .64.04.98.11.04.01.08.02.12.04.41.12.73.23 1 .33.53.25.96.6 1.14 1.06.05.16.1.34.14.57.35 1.31.35 2.62.29 3.93-.1 2.67.07 5.33-.19 8 .1 1.03 1.66.87 1.57-.15-.29-2.62-.08-5.23-.19-7.85-.09-1.64-.01-3.33.58-4.91.07-.15.27-.3.57-.45.49-.21 3.36-1.06 3.54 1.19.04.88-.11 1.79-.15 2.65-.16.78-.37 1.99.45 2.47.37.15.79-.03.93-.4.28-.69.21-1.38.04-2.07-.06-1-.25-2.31-.05-3.37.16-.45 1.73-.81 2.51-.73h.01c3.89.15 7.79.21 11.69-.16 2.55-.23 2.52-3.91 0-4.13z"/><path fill="#000" d="m4.52 3.27.05-.05c-.03 0-.06-.01-.09 0l.04.06zM5.22 2.73c-.52-.26-.46.28-.65.49.27.06.58.45.78-.09.04-.11-.04-.35-.13-.4M2.19 2.78c-.03.13-.05.33.18.28.11-.03.23-.17.27-.28.04-.13-.02-.28-.06-.65-.25.42-.35.52-.38.65zM3.76 3c-.12-.01-.27.02-.33.08-.14.15.13.21.28.29.2.03.42.06.43-.1 0-.15-.17-.25-.38-.27M6.26 2.45l-.11-.07c0 .07 0 .15.03.22.01.03.07.05.11.08 0-.07-.02-.15-.03-.22zM7.78 2.92c-.05.15.03.51.06.51.47 0 .66-.34.82-.71-.39-.37-.7-.31-.88.2M8.68 2.69s-.01.02-.02.03h.01v-.04zM9.71 3.32c-.11.07-.27.2-.08.32.09.06.28.05.39 0 .12-.06.19-.21.42-.5-.48.11-.62.12-.73.18M12.94 3.17c-.09 0-.2-.03-.26 0-.06.04-.08.15-.11.23.09 0 .18.01.28.02.04-.09.07-.17.1-.26zM13.59 2.28s-.08-.04-.12-.07c.01.07.01.15.04.22.01.03.08.05.12.07-.01-.07-.03-.15-.04-.22M15.13 2.65c-.04.15.07.51.09.5.47-.02.63-.38.78-.76-.41-.34-.72-.27-.87.25zM16.01 2.36s0 .02-.01.04h.01zM18.62 3.68c.13.03.28-.04.43-.06-.02-.08-.04-.17-.07-.28-.14 0-.32-.04-.43.03-.17.11-.07.28.08.31zM17.08 2.93c-.11.07-.26.22-.05.33.1.05.29.03.39-.03.11-.07.17-.22.38-.52-.47.14-.61.16-.72.23zM20.3 2.57c-.09 0-.2-.02-.26.02s-.07.15-.1.24h.28c.03-.09.06-.18.09-.26zM19.29 2.69c-.03-.13.19-.48-.19-.38-.15.04-.27.31-.33.49-.03.09.12.23.17.33.31-.04.39-.24.34-.44zM26.99 2.65c.02-.19-.1-.25-.26-.25-.22 0-.39.12-.36.35 0 .1.15.26.23.26.21 0 .35-.14.39-.36M20.79 3.3c-.02.13-.01.34.21.26.11-.04.21-.19.24-.31.02-.13-.05-.28-.13-.64-.21.44-.29.56-.31.68zM21.96 3.26c0 .1.14.2.2.27.28 0 .46-.1.49-.31 0-.07-.16-.21-.27-.24-.21-.04-.41.03-.41.28zM25.46 2.79c-.01.1.12.28.22.31.12.04.28-.03.42-.05-.08-.17-.17-.34-.28-.57-.18.14-.36.21-.37.3zM34.7 3.52v-.07s-.02.05-.04.07zM33.42 3.16c.13.02.28-.06.42-.1-.03-.08-.06-.16-.09-.27-.14.02-.33-.01-.43.06-.17.12-.05.28.1.3zM46.86 2.87l-.02-.06s0 .06-.01.08c0 0 .02-.01.03-.02M48.56 2.99l.06-.03c-.03-.01-.05-.03-.08-.03 0 0 .02.06.02.07z"/><path fill="#000" d="M49.37 2.66c-.43-.39-.52.14-.76.29.25.13.44.6.78.13.07-.09.06-.35-.02-.42M41.25 3.53c.09-.09.08-.27.11-.41-.19.01-.38.02-.63.04.06.22.06.41.14.46.09.05.3 0 .38-.09M48.67 3.94c.09-.17 0-.27-.14-.33-.21-.08-.4-.04-.47.19-.03.09.04.3.12.33.19.08.38 0 .5-.19zM47.9 2.52c-.11-.05-.27-.05-.34-.01-.18.1.07.24.19.36.19.09.39.17.44.02.05-.14-.1-.29-.29-.36zM47.2 3.49c-.05.09 0 .3.09.38.09.09.27.08.41.11-.01-.19-.02-.38-.04-.63-.22.06-.41.06-.46.14M45.46 3.52c-.11-.06-.31-.14-.32.09 0 .11.1.27.2.34.11.07.28.06.64.12-.33-.36-.41-.48-.52-.55M54.24 3.01l-.02-.06v.08s.02-.01.03-.02zM53.7 4.33s.18.06.22.02c.28-.2.23-.52.25-.81.01-.17.03-.34.04-.51-.15.11-.32.2-.43.33-.22.29-.29.63-.09.96zM55.95 3.04s.04-.02.06-.04c-.03-.01-.05-.02-.08-.03 0 0 .02.06.02.07M56.75 2.66c-.45-.37-.51.17-.74.33.25.12.47.57.78.08.06-.1.04-.35-.04-.42z"/><path fill="#000" d="M48.69 3.99c.08-.1.06-.27.09-.42-.19.02-.38.05-.63.08.07.21.08.41.17.45s.3-.02.37-.11M56.11 3.98c.08-.17-.01-.27-.16-.32-.21-.07-.4-.01-.46.21-.02.1.06.29.13.32.2.07.38-.02.48-.22zM47.87 2.97l.27-.2c-.05-.1-.09-.21-.14-.32-.08.06-.21.1-.22.17-.01.11.06.23.09.35M52.87 2.54h-.04v.01l.04-.02zM55.27 2.6c-.12-.04-.27-.04-.34 0-.17.11.08.23.21.34.19.08.39.15.44 0 .04-.14-.12-.28-.31-.35zM51.91 4.21s.02.04.04.06c.01-.03.03-.05.03-.08 0 0-.06.02-.07.02M51.17 2.91c-.03.09.07.24.1.32.26.09.47.06.56-.13.03-.06-.08-.26-.18-.31-.18-.11-.4-.1-.48.13zM54.62 3.61c-.04.09.02.3.11.37.1.08.27.06.42.09-.02-.19-.05-.38-.08-.63-.21.07-.41.08-.45.17M52.89 3.75c-.12-.06-.32-.12-.31.11 0 .11.11.27.21.32.12.06.28.04.65.08-.35-.34-.43-.46-.55-.52zM61.59 3.62l-.03-.06v.08s.02-.02.03-.02"/><path fill="#000" d="M56 2.98c0-.14.27-.44-.12-.41-.15.01-.31.26-.41.43-.04.08.07.24.11.35.31.01.42-.17.41-.37zM63.28 3.38s.04-.03.05-.05c-.03 0-.06-.02-.09-.01l.03.06zM64.01 2.88c-.5-.29-.48.25-.68.45.27.08.55.49.78-.04.05-.11-.02-.35-.11-.41zM55.3 4.59c.07-.07.14-.14.23-.24-.06-.09-.12-.19-.19-.29-.07.07-.2.14-.19.2 0 .11.09.22.15.33M57.38 3.84c-.04.12-.07.33.16.29.11-.02.24-.15.29-.26.05-.12 0-.28-.02-.65-.28.4-.39.5-.42.62zM59.38 2.85c-.15.06-.36.36-.34.38.31.36.69.26 1.08.14.02-.53-.24-.73-.74-.53zM60.16 3.37s-.02 0-.04.01v.01zM62.53 3.06c-.12-.02-.28 0-.33.06-.15.14.12.22.26.31.2.04.41.09.43-.07.02-.14-.16-.26-.36-.29zM59.48 5.18s.03.04.05.05c0-.03.02-.06.01-.09l-.06.03zM56.55 4.22c.11-.06.27-.12.26-.14-.07-.23-.12-.49-.26-.67-.2-.26-.22.03-.2.13.04.23.13.45.2.69zM58.54 4.01c-.02.1.11.22.15.3.28.05.47-.01.53-.22.02-.07-.12-.24-.23-.28-.19-.08-.41-.04-.46.2zM67.93 2.69v.04h.01l-.02-.04z"/><path fill="#000" d="M67.66 3.77c.39-.26.35-.65.28-1.05-.53-.08-.76.14-.62.66.04.16.32.4.34.39M63.3 3.84c.01-.14.32-.41-.07-.42-.15 0-.34.21-.46.37-.05.07.04.25.07.37.3.05.44-.11.46-.32M72.06 2.09c.09.02.21-.12.49-.3-.11-.15-.21-.31-.32-.46-.1.1-.23.19-.28.3-.08.17-.15.39.12.46zM71.8 2.59c-.24-.26-.35-.42-.5-.53-.03-.02-.23.1-.27.19-.05.11 0 .26 0 .39.13 0 .25-.01.78-.04zM68.27 4.23c-.05.12-.11.32.12.31.11 0 .26-.12.32-.22.06-.12.03-.28.06-.65-.33.36-.45.45-.5.56M70.49 1.8l-.06-.27c-.07.05-.18.09-.21.16s.02.17.04.25c.08-.05.16-.09.24-.14zM73.11 2.63c-.05-.06-.09-.16-.16-.18-.05-.01-.13.07-.19.12.03.08.06.17.09.25l.26-.18zM68.67 1.96c-.03.45.15.74.51.88.18.07.49.05.4-.21-.11-.31-.38-.57-.61-.83-.02-.02-.21.11-.31.16zM71.28 3.73c-.04.1.03.32.11.36.1.05.26-.04.42-.08 0-.18.04-.4-.03-.45-.19-.12-.41-.04-.5.16zM70.39 3.77c-.06-.08-.11-.18-.19-.22s-.19 0-.3 0c.07.08.12.19.21.22.08.04.19 0 .28 0M69.16 3.89c-.05-.06-.09-.12-.15-.17-.03-.02-.09 0-.13 0 .05.06.1.11.15.17z"/><path fill="#000" d="M67.35 2.75c-.36-.33-.45-.45-.56-.5-.12-.05-.32-.11-.31.12 0 .11.12.26.22.32.12.06.28.03.65.06M72.23 2.92c.05-.18-.02-.49-.26-.37-.29.15-.51.45-.74.71-.02.02.14.2.2.28.45-.03.71-.25.8-.62M75.02 2.76s0 .02.01.04h.01zM74.89 3.88c.36-.31.26-.69.14-1.08-.53-.02-.73.24-.53.74.06.15.37.36.39.34M70.58 4.5c0-.14.27-.44-.12-.41-.15.01-.31.26-.41.43-.04.08.07.24.11.35.31 0 .42-.17.41-.37zM77.86 4.89s.04-.03.05-.05c-.03 0-.06-.02-.09-.01l.03.06zM78.59 4.39c-.5-.29-.48.25-.68.45.27.08.55.49.78-.04.05-.11-.02-.35-.11-.41zM78.84 2.17c-.27-.23-.41-.37-.57-.46-.04-.02-.22.13-.25.22-.03.11.03.25.05.38.12-.02.25-.05.77-.14M75.56 4.25c-.04.12-.07.33.16.29.11-.02.24-.15.28-.26.05-.12 0-.28-.02-.65-.28.4-.39.5-.42.62M77.44 1.55c-.03-.09-.06-.17-.09-.26-.07.06-.17.11-.19.18s.04.16.07.25c.07-.06.14-.11.22-.17zM80.15 2.04c-.06-.06-.11-.15-.18-.16-.05 0-.12.09-.18.14l.12.24.23-.21zM73.04 1.88c.03-.08-.02-.18-.03-.28-.07.07-.17.13-.19.22-.03.08.02.19.03.3.07-.08.17-.15.2-.23zM73.3 2.93s-.01-.09-.02-.13c-.05.06-.11.1-.15.17-.02.03.01.09.02.13.05-.06.1-.11.15-.17M75.66 1.95c.03.45.25.71.62.8.18.05.49-.02.37-.26-.15-.29-.45-.51-.71-.74-.02-.02-.2.14-.28.2M77.11 4.57c-.12-.02-.28 0-.33.06-.15.14.12.22.26.31.2.04.41.09.43-.07.01-.14-.16-.26-.36-.29zM78.47 3.37c-.03.1.07.31.15.34.1.03.25-.07.41-.13-.03-.18-.01-.41-.08-.44-.2-.09-.41 0-.48.23M77.6 3.53c-.07-.07-.13-.17-.22-.19-.08-.03-.19.02-.3.03.08.07.15.17.23.2s.18-.02.28-.03zM76.4 3.8c-.06-.05-.1-.11-.17-.15-.03-.02-.09.01-.13.02.06.05.11.1.17.15.04 0 .09-.01.13-.02"/><path fill="#000" d="M74.45 2.9c-.4-.28-.5-.39-.62-.42-.12-.04-.33-.07-.29.16.02.11.15.24.26.28.12.05.28 0 .65-.02M79.25 3.55c0-.19-.11-.48-.33-.31-.26.2-.41.54-.59.84-.01.02.17.17.25.24.44-.12.65-.38.67-.77M81.96 2.86s.01.02.02.03h.01zM82.05 3.97c.29-.37.12-.73-.07-1.08-.53.09-.67.37-.38.82.09.13.43.28.44.26zM83.55 4.96l-.04-.05s.02.05.02.08c0 0 .01-.02.02-.03M78.62 2.29c.29.14.29-.14.38-.29-.02-.21-.04-.43-.3-.44-.24 0-.35.18-.31.39.02.13.13.28.24.34zM85.16 4.39s.03-.04.04-.06h-.09l.04.05zM85.78 3.77c-.55-.19-.42.34-.58.57.28.02.64.37.76-.19.02-.11-.09-.34-.18-.38M85.64 5.22c.02-.19-.1-.25-.26-.24-.22 0-.38.13-.36.36.01.1.15.26.24.26.21 0 .35-.15.38-.37zM85.6 1.53c-.31-.17-.47-.29-.65-.34-.04-.01-.19.16-.2.26-.01.12.08.24.12.37.12-.05.24-.09.73-.29M82.78 4.21c-.01.13 0 .34.21.26.1-.04.21-.2.23-.31.02-.13-.06-.28-.15-.63-.2.45-.28.57-.3.69zM84.11 1.2c-.05-.08-.1-.16-.14-.24-.05.07-.15.14-.15.22 0 .07.07.15.11.23zM86.86 1.16c-.07-.05-.14-.13-.21-.12-.05 0-.1.11-.14.17.05.07.11.14.16.21zM79.85 2.37c0-.08-.06-.18-.09-.27-.05.08-.14.16-.15.25s.05.18.09.28c.06-.1.14-.18.15-.27zM80.31 3.35l-.05-.13c-.04.06-.09.12-.11.19-.01.03.03.08.04.13.04-.06.08-.13.11-.19zM79.46 6c-.01.13 0 .34.21.26.1-.04.21-.2.23-.31.02-.13-.06-.28-.15-.63-.2.45-.28.57-.3.69zM82.43 1.93c.12.44.38.65.77.67.19 0 .48-.11.31-.33-.2-.26-.54-.41-.84-.59-.02-.01-.17.17-.24.25M81.24 4.64c-.13.09-.28.43-.26.44.37.29.73.12 1.08-.07-.09-.53-.37-.67-.82-.38zM82.09 5s-.02.01-.03.02v.01zM84.37 4.22c-.12 0-.27.06-.32.12-.12.17.16.19.32.25.21 0 .42 0 .41-.15s-.21-.22-.41-.22M85.47 2.78c0 .1.13.3.22.31.11.01.23-.12.37-.21-.06-.17-.09-.4-.17-.41-.22-.05-.41.09-.42.31M80.63 5.94c0 .1.15.2.21.27.28 0 .46-.11.48-.32 0-.07-.17-.21-.28-.23-.21-.04-.41.04-.41.29zM84.64 3.11c-.08-.05-.16-.14-.25-.15s-.18.05-.28.09c.1.06.18.14.27.15.08 0 .18-.06.27-.09zM83.52 3.61c-.06-.04-.12-.09-.19-.11-.03-.01-.08.03-.13.04.06.04.13.08.19.11.04-.02.08-.03.13-.05z"/><path fill="#000" d="M81.43 3.1c-.45-.2-.57-.28-.69-.3-.13-.01-.34 0-.26.21.04.1.2.21.31.23.13.02.28-.06.63-.15zM86.26 4.84c-.06-.18-.27-.42-.41-.19-.18.28-.21.65-.27.99 0 .03.22.1.32.14.37-.26.48-.57.37-.94zM88.58 3.28l.03.03h.01l-.04-.02z"/><path fill="#000" d="M89.04 4.3c.15-.45-.13-.73-.43-1-.47.26-.51.58-.08.9.13.1.5.12.5.09zM85.24 3.87c.32.04.23-.23.26-.4-.09-.19-.19-.39-.43-.31-.23.08-.27.29-.16.47.06.11.22.22.34.24zM85.32 1.38c.1-.03.24-.22.22-.31-.02-.1-.19-.18-.32-.28-.14.12-.34.22-.33.29.03.22.22.35.44.29zM91.57.81c-.35-.06-.54-.11-.72-.11-.04 0-.12.22-.1.32.03.11.15.2.24.31.1-.08.19-.17.59-.51zM89.81 4.28c.03.13.11.32.29.17.09-.07.13-.26.11-.37-.02-.13-.15-.24-.35-.55-.04.49-.08.63-.05.75M90.05 1a3 3 0 0 0-.21-.17c-.03.09-.09.18-.07.25s.12.12.18.18c.03-.08.07-.17.1-.26M86.43 3.53c-.02-.08-.11-.15-.17-.22-.02.1-.08.2-.06.29.02.08.11.15.18.24.02-.11.07-.21.05-.3zM87.19 4.3s-.06-.07-.09-.1c-.01.07-.04.15-.04.22 0 .04.05.07.08.11.01-.07.03-.15.04-.22zM87.28 7.08c.03.13.11.32.29.17.09-.07.13-.26.11-.37-.02-.13-.15-.24-.35-.55-.04.49-.08.63-.05.75M88.82 1.21c.28-.12.37-.33.3-.61-.06-.26-.28-.32-.47-.27-.28.08-.39.3-.3.6.07.24.26.28.47.29zM88.72 2.25c.26.37.57.48.94.37.18-.06.42-.27.19-.41-.28-.18-.65-.21-.99-.27-.03 0-.1.22-.14.32zM88.49 5.2c-.1.13-.12.5-.09.5.45.15.73-.13 1-.43-.26-.47-.58-.51-.9-.08z"/><path fill="#000" d="m89.42 5.25-.03.03v.01l.02-.04zM87.46 2.02c.11-.07.52 0 .29-.31-.09-.12-.38-.14-.58-.13-.09 0-.17.19-.25.28.15.27.36.28.53.17zM91.86 2.03c.03.1.22.24.31.22.1-.02.18-.19.28-.32-.12-.14-.22-.34-.29-.33-.22.03-.35.22-.29.44zM88.36 6.63c.03.09.21.14.28.18.26-.1.4-.25.34-.46-.02-.07-.23-.14-.34-.13-.21.03-.37.18-.29.41zM91.19 2.62c-.1-.02-.2-.08-.29-.06-.08.02-.15.11-.24.18.11.02.21.07.3.05.08-.02.15-.11.22-.17zM90.3 3.46c-.07-.01-.15-.04-.22-.04-.04 0-.07.05-.11.08.07.01.15.03.22.04.03-.03.07-.06.1-.09zM86.03 2.32c.05-.1.1-.21.15-.31-.09-.02-.22-.1-.27-.06-.09.06-.14.19-.21.29.09.02.19.05.32.08zM88.17 3.69c-.49-.04-.63-.08-.75-.05-.13.03-.32.11-.17.29.07.09.26.13.37.11.13-.02.24-.15.55-.35M99.16 3.68s0-.05.01-.07a.3.3 0 0 0-.08.04s.06.02.06.03zM99.4 2.83c-.57.1-.21.5-.24.78.26-.11.74.03.58-.53-.03-.11-.24-.26-.34-.24z"/><path fill="#000" d="M92.1 2.47c.09-.04.2-.25.17-.34-.04-.1-.22-.15-.36-.23-.12.14-.31.27-.29.34.06.21.27.31.48.22zM98.18.95c-.36 0-.55-.03-.73 0-.04 0-.09.24-.05.33.05.11.18.18.28.27.08-.1.16-.19.5-.6M96.71 1.37c-.08-.05-.16-.09-.24-.14-.01.09-.06.19-.03.26s.14.1.21.15zM99.11.03c-.08 0-.18-.05-.24-.01-.04.02-.03.14-.05.22.08.04.16.07.24.1l.04-.31zM95.53 1.77c.26-.16.31-.38.2-.65-.1-.24-.32-.27-.5-.19-.26.12-.34.35-.2.63.11.23.3.24.51.21zM95.59 2.81c.31.33.64.39.99.22.17-.08.37-.33.12-.44-.3-.13-.68-.11-1.02-.12-.03 0-.06.23-.09.33zM94.31 2.77c.1-.09.51-.08.24-.35-.11-.11-.4-.08-.59-.04-.09.02-.14.21-.2.31.19.24.4.22.55.08M98.66 2.11c.04.09.25.2.34.17.1-.04.15-.22.23-.36-.14-.12-.27-.31-.34-.29-.21.06-.31.27-.22.48zM98.09 2.79c-.1 0-.21-.04-.29-.01s-.13.13-.21.21c.11 0 .22.04.3 0 .08-.03.13-.13.19-.2zM92.95 3.29c.03-.11.07-.22.1-.33-.09 0-.23-.06-.28-.02-.08.08-.11.21-.16.32.1 0 .19.02.33.03zM100.23 4.34c.31.09.27-.19.32-.35-.05-.2-.12-.42-.37-.38-.24.04-.31.24-.24.44.04.12.17.26.29.29M100.74 1.9c.1 0 .27-.17.27-.27 0-.11-.16-.21-.27-.33-.16.09-.38.16-.38.23-.01.22.16.38.38.36zM101.45 4.2c0-.08-.08-.17-.13-.25-.04.09-.11.18-.11.27s.08.17.14.26c.04-.1.1-.2.1-.29zM102.73 2.89c.13-.05.51.09.34-.26-.07-.14-.35-.2-.55-.23-.09-.01-.2.16-.29.23.1.29.31.33.5.25zM101.27 2.94c.07-.09.14-.19.21-.28-.09-.04-.2-.13-.25-.11-.1.05-.17.17-.26.25.09.04.18.08.3.13z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h103.37v19.32H0z"/></clipPath></defs></svg>`;
const LOCAL_AUDIO_SRC = '/assets/images/paperheartconfetti.mp3';

const EPISODES = [
  {
    navLabel: 'Prólogo',
    title: 'Prólogo',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_06.jpg',
    numberSvg: 'PR',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'Estas personas habitaron otro mundo, con otras reglas. Fueron Testigos de Jehova. Cuesta creer lo que les ocurrio y a veces puede que tambien nos resulte dificil entender por que. Sus historias son duras y tristes, pero antes de escucharlas hay que saber como acercarnos a ellas.',
    link: 'https://www.abc.es/sociedad/escucha-20240422100737-nt.html#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: false,
  },
  {
    navLabel: 'Episodio 1',
    title: 'El primer desconcierto',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_01.jpg',
    numberSvg: '01',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'Los hijos de los Testigos de Jehova se crian en una burbuja, apenas se mezclan con sus companeros de colegio y tienen prohibido celebrar los cumpleanos. Aprenden desde pequenos que el fin de este mundo puede ocurrir en cualquier momento. Son un grupo de ninos diferentes y se sienten los elegidos.',
    link: 'https://www.abc.es/sociedad/primer-desconcierto-20240422100757-nt.html#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: false,
  },
  {
    navLabel: 'Episodio 2',
    title: 'Los silencios',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_02.jpg',
    numberSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"><path fill="#e84c4f" d="M13.94 16.33c0-.41.48-.19.8-.43s.33-.23.66-.48.23-.37.56-.61.36-.2.69-.44.4-.14.73-.39.2-.41.52-.66.45-.08.78-.32.3-.28.63-.52.3-.28.63-.52.28-.3.61-.54.39-.17.71-.41.26-.34.59-.58.42-.13.74-.38.19-.55.6-.57.36.21.71.42.29.32.64.53.47.02.82.23.26.36.62.57.33.25.68.47.43.09.78.3.3.3.65.51.39.15.75.36.39.15.74.36.35.22.7.43.36.19.72.4.35.22.7.44.26.36.62.58.35.23.7.44.52 0 .82.28c.02.25.03.55.04.78.01.25 0 .49.01.71 0 .26-.15.49-.15.71 0 .28.19.56.17.83s-.21.53-.25.8.01.56-.05.82-.24.5-.32.76-.18.51-.28.76-.21.5-.34.74-.08.59-.23.82-.44.36-.61.58c-.16.21-.23.52-.44.74-.18.19-.47.31-.69.51-.2.18-.47.3-.69.49-.21.17-.42.36-.65.54-.21.17-.44.34-.67.51-.22.16-.33.49-.57.66-.22.16-.51.24-.75.4-.23.15-.52.22-.76.38s-.38.43-.63.58-.47.3-.72.45-.53.21-.77.36-.45.34-.7.49-.54.2-.79.34c-.26.15-.52.27-.76.41-.26.15-.52.28-.76.43-.26.16-.48.36-.71.51-.26.16-.42.44-.65.59-.26.17-.56.25-.77.4-.26.19-.49.35-.69.52-.22.18-.5.31-.71.52s-.24.56-.43.78-.43.38-.61.62-.46.52-.62.77c.26-.11.58-.36.83-.47.26-.11.54-.16.79-.26.26-.1.49-.28.74-.38.27-.1.59 0 .85-.09.27-.09.49-.3.75-.37.27-.08.57-.02.83-.08s.48-.27.74-.32.55.06.81.02.51-.23.77-.25.53-.09.79-.1.53.18.8.18c.28 0 .57-.18.85-.17s.55.23.83.25.58-.17.86-.14.53.27.81.31c.31.05.62.02.89.07.32.05.62.08.88.13.33.07.59.23.83.3.43.14.47.01.89.15s.42.17.84.31.4.23.82.37.62-.19.77.23c.13.38-.21.21-.49.51s-.16.4-.43.7-.29.28-.57.57-.37.21-.65.5-.15.41-.43.71-.38.2-.66.5-.12.49-.46.7c-.27-.09-.56-.23-.81-.31-.27-.09-.54-.14-.79-.22-.27-.09-.49-.32-.73-.4-.28-.09-.54-.18-.78-.26-.29-.09-.56-.14-.8-.2-.31-.08-.61.04-.83 0-.25-.05-.49-.12-.74-.17s-.49-.13-.73-.16-.49-.21-.73-.23-.51 0-.76-.02a10 10 0 0 0-.76-.04c-.27 0-.55.06-.83.07s-.53.21-.81.24-.54.05-.82.09-.56-.05-.84 0-.51.24-.78.31-.54.11-.81.19-.52.18-.78.26-.57.05-.83.14-.49.26-.75.37c-.56.22-.89.19-.98.19s-.17.09-.21.03c-.06-.07 0-.19 0-.34 0-.27.02-.55.1-.87.06-.27-.02-.61.1-.91.1-.26.35-.49.49-.78.11-.25.25-.48.39-.73s.2-.52.35-.75.26-.48.42-.71.33-.44.5-.66.29-.47.47-.69.35-.42.54-.63c.16-.18.36-.38.56-.59.18-.18.51-.23.71-.43.19-.18.31-.44.52-.63.19-.17.48-.26.69-.45.2-.17.38-.37.6-.55.2-.17.39-.37.61-.55.2-.17.45-.3.67-.47.21-.17.37-.38.56-.54.21-.17.45-.28.64-.44.21-.17.3-.46.49-.62.21-.18.37-.38.55-.55.2-.18.41-.33.59-.49.2-.19.5-.25.67-.42.2-.2.33-.44.48-.61.2-.22.29-.52.47-.75s.39-.44.55-.67.48-.39.63-.63.23-.55.37-.8.29-.51.41-.77.14-.54.23-.8.15-.52.22-.79.27-.51.31-.78.02-.56.04-.83.04-.55.04-.83-.16-.56-.19-.84 0-.57-.07-.84-.08-.57-.18-.83-.2-.53-.34-.78-.41-.4-.57-.63-.31-.46-.5-.67-.36-.47-.58-.66c-.38.14-.32.27-.65.52s-.26.33-.59.57-.42.12-.75.36-.24.36-.57.61-.33.24-.65.49-.39.16-.71.41-.34.23-.66.48-.26.33-.59.58-.37.19-.69.44-.24.36-.56.61-.44.1-.77.35-.29.3-.61.55-.26.34-.59.59-.3.48-.72.44c-.44-.04-.28-.35-.59-.67s-.35-.27-.66-.59-.24-.38-.55-.7-.33-.29-.71-.52c-.44-.27-.7-.26-.69-.7z"/><path fill="#000" d="M9.61 20.31c-.35-.22-.29.34-.58.63s-.34.24-.63.53l-.58.58c-.29.29-.27.32-.56.61s-.27.31-.56.61-.3.29-.59.58-.33.26-.62.55-.25.33-.54.62-.32.26-.62.55-.27.31-.56.6-.33.26-.62.55-.25.33-.55.63-.3.29-.59.58-.46.19-.61.58c-.17.44 0 .48 0 .95v1.88h.02c.29-.29.31-.27.6-.56s.28-.3.57-.59.28-.3.57-.59.3-.29.59-.58.26-.32.55-.61.32-.26.61-.55.25-.33.54-.63.34-.24.63-.53.24-.34.53-.63.34-.24.64-.53.29-.3.58-.59.26-.32.56-.62.31-.28.6-.58.44-.2.59-.59c.17-.44-.04-.47-.04-.94s-.08-.49.04-.94c.13-.52.42-.72.02-.97zM46.57 19.53c-.35-.22-.27.26-.56.55s-.28.3-.57.59-.3.28-.59.57-.27.31-.57.6-.32.26-.61.55-.31.27-.6.56-.28.31-.57.6-.3.28-.59.57-.27.31-.56.61-.27.31-.56.6-.34.24-.64.54-.28.31-.58.6-.25.34-.54.63-.47.17-.62.56c-.17.44.04.47.04.94s-.06.47-.06.94-.37.69.03.94c.35.22.3-.27.6-.56s.25-.33.54-.62.34-.24.63-.54.29-.3.58-.59l.58-.58c.29-.29.27-.31.57-.6s.28-.31.57-.6.31-.27.6-.56.32-.26.61-.56.27-.31.56-.6.31-.28.6-.57.3-.29.59-.59.27-.31.57-.61.41-.22.56-.61c.17-.44.01-.46.01-.93s-.13-.49-.02-.95c.12-.49.41-.66.01-.91z"/></svg>`,
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'El bautizo es el momento mas importante en la vida de los Testigos de Jehova. Ese dia adquieren un compromiso irreversible y, a partir de entonces, cualquier fallo les puede hacer sentir indignos de su dios. Esa culpabilidad acabara silenciando otros pecados.',
    link: 'https://www.abc.es/sociedad/silencios-20240428133246-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: false,
  },
  {
    navLabel: 'Episodio 3',
    title: 'El eclipse de Dios',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_03.jpg',
    numberSvg: '03',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'La presion por vivir como un buen Testigo de Jehova se vuelve insoportable. Los miembros de cada congregacion se espian entre ellos y el control ya es total. Las dudas y las contradicciones se agolpan hasta que un rayo de luz se cuela en mitad de la noche.',
    link: 'https://www.abc.es/sociedad/eclipse-dios-20240505181104-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: false,
  },
  {
    navLabel: 'Episodio 4',
    title: '04',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_04.jpg',
    numberSvg: '04',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'Abandonar esta religion implica salir de un mundo y aterrizar de emergencia en otro desconocido. Los exfieles tienen que despedirse de su vida anterior, tambien de su familia y amigos. Se han quedado solos y ahora les toca volver a nacer.',
    link: 'https://www.abc.es/sociedad/nuevo-mundo-20240512135037-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: true,
  },
  {
    navLabel: 'Episodio 5',
    title: 'La sociedad de los conmovidos',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_05.jpg',
    numberSvg: '05',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'La conciencia colectiva se enciende gracias a la escucha. Conocer experiencias similares les hace ser conscientes de que sus casos no son los unicos. Este grupo de personas necesita un nombre y cuando toca elegirlo siempre gana el mismo: victimas. Todas muy diferentes, pero victimas.',
    link: 'https://www.abc.es/sociedad/sociedad-conmovidos-20240519121221-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: true,
  },
  {
    navLabel: 'Episodio 6',
    title: 'El honor',
    imageSrc: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_06.jpg',
    numberSvg: '06',
    audioSrc: LOCAL_AUDIO_SRC,
    text: 'Dos mundos colisionan en una sala de vistas de Torrejon de Ardoz: declaran fieles y pecadores o, lo que es lo mismo, Testigos de Jehova y extestigos. Un juicio extrano y desigual donde la acusacion tiene mucho que perder y los acusados muy poco que ganar. Podran seguir llamandose a si mismos victimas?',
    link: 'https://www.abc.es/sociedad/honor-20240526123651-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada',
    disabled: true,
  },
];

/* =========================
  Utils
========================= */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatAudioDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Sin audio';

  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${m}:${s}`;
};

/* =========================
  Main Component
========================= */

export default function dvdScroller() {
  const root = document.querySelector('.v-n-dvd');
  const navList = document.querySelector('[data-dvd-nav-list]');
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!root || !navList || !gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* =========================
    State
  ========================= */

  const state = {
    currentStep: 0,
    isReady: false,
    episodes: [],
    enabledEpisodes: [],
    stepMap: new Map(),
    timeline: null,
    transition: null,
  };

  /* =========================
    Init data
  ========================= */

  state.episodes = EPISODES.map((ep, i) => ({
    ...ep,
    originalIndex: i,
  }));

  state.enabledEpisodes = state.episodes
    .filter((ep) => !ep.disabled)
    .map((ep, stepIndex) => ({
      ...ep,
      stepIndex,
    }));

  state.stepMap = new Map(
    state.enabledEpisodes.map((ep) => [ep.originalIndex, ep.stepIndex]),
  );

  if (!state.enabledEpisodes.length) return;

  /* =========================
    DOM refs
  ========================= */

  const dom = {
    container: root.querySelector('.v-n-dvd-ep'),
    image: root.querySelector('[data-dvd-img]'),
    number: root.querySelector('[data-dvd-number]'),
    title: root.querySelector('[data-dvd-title]'),
    text: root.querySelector('[data-dvd-text]'),
    link: root.querySelector('[data-dvd-link]'),
    prev: root.querySelector('[data-dvd-prev]'),
    next: root.querySelector('[data-dvd-next]'),

    player: root.querySelector('.v-ply'),
    playerButton: root.querySelector('.v-ply__b'),
    playerTitle: root.querySelector('.v-ply__t'),
    playerDuration: root.querySelector('.v-ply__p'),
    playerProgress: root.querySelector('progress'),
    audio: root.querySelector('audio'),
  };

  const contentTargets = [
    dom.image,
    dom.number,
    dom.title,
    dom.player?.closest('.v-cmp-ply') || dom.player,
    dom.text,
    dom.link?.closest('.v-btn-c') || dom.link,
  ].filter(Boolean);

  /* =========================
    Nav
  ========================= */

  const renderNav = () => {
    const fragment = document.createDocumentFragment();

    state.episodes.forEach((ep) => {
        const li = document.createElement('li');
        if (ep.disabled) li.classList.add('is-disabled');

        const btn = document.createElement('button');
        btn.type = 'button';

        const step = state.stepMap.get(ep.originalIndex);
        if (step !== undefined) {
            btn.dataset.dvdStep = step;
        } else {
            btn.disabled = true;
            btn.setAttribute('aria-disabled', 'true');
        }

        // Si está deshabilitado, ponemos el SVG ARRIBA y luego el texto
        if (ep.disabled) {
            btn.innerHTML = `
              ${DISABLED_EPISODE_MARK}
              <span>${ep.navLabel}</span>
            `;
        } else {
            // Si está habilitado, solo el texto normal
            btn.innerHTML = `<span>${ep.navLabel}</span>`;
        }

        li.appendChild(btn);
        fragment.appendChild(li);
    });

    navList.innerHTML = '';
    navList.appendChild(fragment);
};

  const updateNav = (activeIndex) => {
    [...navList.children].forEach((li, i) => {
      const isActive = i === activeIndex;
      li.classList.toggle('is-active', isActive);

      const btn = li.querySelector('button');
      if (btn) {
        btn.setAttribute('aria-current', isActive);
      }
    });
  };

  /* =========================
    Player
  ========================= */

  const resetPlayer = () => {
    if (!dom.audio) return;

    dom.audio.pause();
    dom.audio.currentTime = 0;
    dom.audio.removeAttribute('src');
    dom.audio.load();

    if (dom.playerProgress) {
      dom.playerProgress.value = 0;
      dom.playerProgress.max = 0;
    }
  };

  const updatePlayer = (ep) => {
    if (!dom.player || !dom.audio) return;

    resetPlayer();

    const hasAudio = Boolean(ep.audioSrc);

    dom.player.classList.toggle('is-empty', !hasAudio);
    dom.playerButton.disabled = !hasAudio;

    if (dom.playerTitle) {
      dom.playerTitle.textContent = ep.title;
    }

    dom.playerDuration.textContent = hasAudio ? 'Cargando...' : 'Sin audio';

    if (!hasAudio) return;

    dom.audio.src = ep.audioSrc;
    dom.audio.load();
  };

  const updateImageWithFade = (imgEl, newSrc, alt = '') => {
    return new Promise((resolve) => {
      if (!imgEl) {
        resolve();
        return;
      }

      const MIN_DELAY = 1000; // 1 segundo
      const startTime = performance.now();

      // Fade out
      imgEl.style.transition = 'opacity 0.2s ease';
      imgEl.style.opacity = '0';

      // Crear imagen en background
      const img = new Image();
      img.src = newSrc;

      const handleLoad = () => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(MIN_DELAY - elapsed, 0);

        setTimeout(() => {
          // Cambiar src cuando esté lista
          imgEl.src = newSrc;
          imgEl.alt = alt;

          // Fade in
          requestAnimationFrame(() => {
            imgEl.style.transition = 'opacity 0.4s ease';
            imgEl.style.opacity = '1';
          });

          resolve();
        }, remaining);
      };

      img.onload = handleLoad;
      img.onerror = handleLoad; // fallback
    });
  };

  /* =========================
    Render
  ========================= */

  const renderEpisode = (ep) => {
    return new Promise((resolve) => {
      // 1. Actualizamos textos y links (esto es instantáneo)
      if (dom.number) dom.number.innerHTML = ep.numberSvg;
      if (dom.title) dom.title.textContent = ep.title;
      if (dom.text) dom.text.textContent = ep.text;
      if (dom.link) {
        dom.link.href = ep.link || '#';
        dom.link.hidden = !ep.link;
      }

      if (!dom.image || !ep.imageSrc) {
        updatePlayer(ep);
        updateNav(ep.originalIndex);
        // Actualizamos el dataset aquí también si no hay imagen
        dom.container.dataset.dvdEpisodeActive = ep.originalIndex;
        resolve();
        return;
      }

      dom.image.onload = () => {
        updatePlayer(ep);
        updateNav(ep.originalIndex);
        // El "ID" del episodio activo cambia justo cuando la imagen está lista
        dom.container.dataset.dvdEpisodeActive = ep.originalIndex;
        resolve();
      };

      dom.image.onerror = resolve;
      dom.image.src = ep.imageSrc;
      dom.image.alt = ep.title;
    });
  };

  /* =========================
    Animation
  ========================= */

  const transitionTo = async (ep) => {
    if (!dom.container) return;

    // Comprobamos el nuevo atributo en el contenedor
    if (dom.container.dataset.dvdEpisodeActive === String(ep.originalIndex)) return;

    dom.container.style.pointerEvents = 'none';

    // 1. Fade Out
    dom.container.classList.remove('is-fade-in');
    dom.container.classList.add('is-fade-out');

    await new Promise(resolve => {
      dom.container.addEventListener('animationend', resolve, { once: true });
    });

    // 2. Carga (renderEpisode ahora actualiza el dataset internamente)
    await renderEpisode(ep);

    // 3. Fade In
    dom.container.classList.remove('is-fade-out');
    dom.container.classList.add('is-fade-in');

    dom.container.style.pointerEvents = '';
  };

  /* =========================
    Navigation
  ========================= */

  const setStep = (step) => {
    const next = clamp(step, 0, state.enabledEpisodes.length - 1);

    if (next === state.currentStep && state.isReady) return;

    state.currentStep = next;
    transitionTo(state.enabledEpisodes[next]);
    updateArrows();

    state.isReady = true;
  };

  const goToStep = (step) => {
    if (!state.timeline?.scrollTrigger) return;

    const y =
      state.timeline.scrollTrigger.start + step * window.innerHeight;

    window.scrollTo({ top: y });
  };

  const updateArrows = () => {
    const isFirst = state.currentStep === 0;
    const isLast =
      state.currentStep === state.enabledEpisodes.length - 1;

    dom.prev.disabled = isFirst;
    dom.next.disabled = isLast;

    dom.prev.classList.toggle('is-hidden', isFirst);
    dom.next.classList.toggle('is-hidden', isLast);
  };

  /* =========================
    ScrollTrigger
  ========================= */

  const getStepFromScroll = (st) => {
    const offset = Math.max(window.scrollY - st.start, 0);
    const step = Math.floor(offset / window.innerHeight);
    return clamp(step, 0, state.enabledEpisodes.length - 1);
  };

  const initScroll = () => {
    state.timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        pin: true,
        start: 'top top',
        end: () =>
          `+=${state.enabledEpisodes.length * window.innerHeight}`,
        onUpdate: (st) => setStep(getStepFromScroll(st)),
        onRefresh: (st) => setStep(getStepFromScroll(st)),
      },
    });
  };

  /* =========================
    Events
  ========================= */

  const bindEvents = () => {
    dom.prev?.addEventListener('click', () => {
      goToStep(state.currentStep - 1);
    });

    dom.next?.addEventListener('click', () => {
      goToStep(state.currentStep + 1);
    });

    navList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dvd-step]');
      if (!btn) return;
      goToStep(Number(btn.dataset.dvdStep));
    });

    if (dom.audio && dom.playerDuration) {
      dom.audio.addEventListener('loadedmetadata', () => {
        dom.playerDuration.textContent = formatAudioDuration(
          dom.audio.duration,
        );
      });
    }
  };

  /* =========================
    Init
  ========================= */

  renderNav();
  setStep(0);
  bindEvents();
  initScroll();
}