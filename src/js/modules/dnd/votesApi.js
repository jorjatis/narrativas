const VOTES_API =
  "https://script.google.com/macros/s/AKfycbwN8IGCHX_t6jcmbKvWvJf14eMJ364vxTe9Rg_2yDG1nwzOo04d9iGzunf7l0mck0Ntxw/exec";

export function syncShares(root) {
  const items = [...root.querySelectorAll(".v-n-dnd-player__drag-item")];
  const max = Math.max(0, ...items.map((item) => Number(item.dataset.votes) || 0));

  items.forEach((item) => {
    const votes = Number(item.dataset.votes) || 0;

    item.dataset.share = String(max ? Math.round((votes / max) * 100) : 0);
  });
}

export function applyPlayers(root, players) {
  if (!Array.isArray(players)) return;

  const byId = new Map(players.map((player) => [String(player.id), player]));

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const row = byId.get(item.dataset.id);

    if (!row) return;

    item.dataset.votes = String(Number(row.votes) || 0);
  });

  syncShares(root);
}

async function requestVotes(action, id) {
  const url = new URL(VOTES_API);

  url.searchParams.set("action", action);
  if (id) url.searchParams.set("id", id);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`Votes API ${response.status}`);

  return response.json();
}

export function loadVotes(root) {
  return requestVotes("get")
    .then((data) => applyPlayers(root, data && data.players))
    .catch(() => {
      root.dataset.votesError = "1";
    });
}

export function castVote(root, id) {
  if (!id) return Promise.resolve(false);

  return requestVotes("vote", id)
    .then((data) => {
      applyPlayers(root, data && data.players);
      root.dataset.votesError = "0";
      return true;
    })
    .catch(() => {
      root.dataset.votesError = "1";
      return false;
    });
}
