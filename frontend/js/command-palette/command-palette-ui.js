function renderCommandPalette(commands = commandPaletteState.filteredCommands) {
    const resultsContainer =
        document.getElementById("commandPaletteResults");

    if (!resultsContainer) {
        return;
    }

    if (!commands.length) {
        resultsContainer.innerHTML = `
            <div class="mc-command-empty">
                <div class="mc-command-empty-icon">⌕</div>
                <strong>No commands found</strong>
                <span>Try another search.</span>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = commands
        .map((command, index) => `
            <button
                type="button"
                class="mc-command-item ${
                    index === commandPaletteState.activeIndex
                        ? "active"
                        : ""
                }"
                data-command-index="${index}"
            >
                <span class="mc-command-icon">
                    ${escapeCommandHtml(command.icon)}
                </span>

                <span class="mc-command-content">
                    <span class="mc-command-title">
                        ${escapeCommandHtml(command.title)}
                    </span>

                    <span class="mc-command-description">
                        ${escapeCommandHtml(command.description)}
                    </span>
                </span>

                <span class="mc-command-category">
                    ${escapeCommandHtml(command.category)}
                </span>
            </button>
        `)
        .join("");

    resultsContainer
        .querySelectorAll(".mc-command-item")
        .forEach((item) => {
            item.addEventListener("click", () => {
                const index =
                    Number(item.dataset.commandIndex);

                executeCommand(index);
            });
        });
}

function escapeCommandHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateCommandPaletteActiveItem() {
    const items =
        document.querySelectorAll(".mc-command-item");

    items.forEach((item, index) => {
        item.classList.toggle(
            "active",
            index === commandPaletteState.activeIndex
        );
    });

    const active =
        items[commandPaletteState.activeIndex];

    if (active) {
        active.scrollIntoView({
            block: "nearest"
        });
    }
}

function openCommandPalette() {
    const overlay =
        document.getElementById("commandPaletteOverlay");

    const input =
        document.getElementById("commandPaletteInput");

    if (!overlay || !input) {
        return;
    }

    commandPaletteState.open = true;
    commandPaletteState.activeIndex = 0;
    commandPaletteState.filteredCommands =
        [...commandPaletteData];

    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");

    input.value = "";
    input.focus();

    renderCommandPalette();
}

function closeCommandPalette() {
    const overlay =
        document.getElementById("commandPaletteOverlay");

    if (!overlay) {
        return;
    }

    commandPaletteState.open = false;

    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
}

function executeCommand(index) {
    const command =
        commandPaletteState.filteredCommands[index];

    if (!command) {
        return;
    }

    closeCommandPalette();

    if (typeof command.action === "function") {
        command.action();
    }
}

function filterCommands(query) {
    const value = query.trim().toLowerCase();

    if (!value) {
        commandPaletteState.filteredCommands =
            [...commandPaletteData];
    } else {
        commandPaletteState.filteredCommands =
            commandPaletteData.filter((command) => {
                return (
                    command.title.toLowerCase().includes(value) ||
                    command.description.toLowerCase().includes(value) ||
                    command.category.toLowerCase().includes(value)
                );
            });
    }

    commandPaletteState.activeIndex = 0;

    renderCommandPalette();
}