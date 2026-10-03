document.addEventListener("DOMContentLoaded", () => {
    injectCommandPalette();

    const input =
        document.getElementById("commandPaletteInput");

    const overlay =
        document.getElementById("commandPaletteOverlay");

    const closeButton =
        document.getElementById("commandPaletteClose");

    if (!input || !overlay) {
        return;
    }

    input.addEventListener("input", () => {
        filterCommands(input.value);
    });

    input.addEventListener("keydown", (event) => {
        const commands =
            commandPaletteState.filteredCommands;

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (commands.length) {
                commandPaletteState.activeIndex =
                    Math.min(
                        commandPaletteState.activeIndex + 1,
                        commands.length - 1
                    );

                updateCommandPaletteActiveItem();
            }
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (commands.length) {
                commandPaletteState.activeIndex =
                    Math.max(
                        commandPaletteState.activeIndex - 1,
                        0
                    );

                updateCommandPaletteActiveItem();
            }
        }

        if (event.key === "Enter") {
            event.preventDefault();

            executeCommand(
                commandPaletteState.activeIndex
            );
        }

        if (event.key === "Escape") {
            event.preventDefault();

            closeCommandPalette();
        }
    });

    closeButton?.addEventListener(
        "click",
        closeCommandPalette
    );

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeCommandPalette();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();

            if (commandPaletteState.open) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }

            return;
        }

        if (
            event.key === "Escape" &&
            commandPaletteState.open
        ) {
            closeCommandPalette();
        }
    });
});

function injectCommandPalette() {
    if (
        document.getElementById(
            "commandPaletteOverlay"
        )
    ) {
        return;
    }

    const markup = `
        <div
            class="mc-command-overlay"
            id="commandPaletteOverlay"
            aria-hidden="true"
        >
            <div
                class="mc-command-palette"
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
            >
                <div class="mc-command-header">
                    <span class="mc-command-search-icon">⌕</span>

                    <input
                        id="commandPaletteInput"
                        type="search"
                        placeholder="Type a command..."
                        autocomplete="off"
                        aria-label="Search commands"
                    >

                    <span class="mc-command-esc">Esc</span>

                    <button
                        type="button"
                        id="commandPaletteClose"
                        class="mc-command-close"
                        aria-label="Close command palette"
                    >
                        ×
                    </button>
                </div>

                <div
                    id="commandPaletteResults"
                    class="mc-command-results"
                ></div>

                <div class="mc-command-footer">
                    <span>
                        <kbd>↑</kbd>
                        <kbd>↓</kbd>
                        Navigate
                    </span>

                    <span>
                        <kbd>Enter</kbd>
                        Select
                    </span>

                    <span>
                        <kbd>Esc</kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        markup
    );
}