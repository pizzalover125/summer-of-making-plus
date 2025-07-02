(async () => {
  const data = await fetch(chrome.runtime.getURL('data.json')).then(res => res.json());

  const cards = document.querySelectorAll('.card-with-gradient');
  const dpsValues = [];

  cards.forEach(card => {
    const quantityEl = card.querySelector(
      'div.absolute.top-2.right-2.text-lg.font-bold.whitespace-nowrap.flex.items-center'
    );

    let quantity = null;
    if (quantityEl) {
      quantity = Array.from(quantityEl.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.nodeValue.trim())
        .join('');
    }

    const priceShells = parseFloat(quantity);
    if (!isNaN(priceShells)) {
      const titleEl = card.querySelector('h3');
      if (!titleEl) return;

      const itemName = titleEl.textContent.trim();
      const match = Object.entries(data).find(([name]) =>
        itemName.toLowerCase().includes(name.toLowerCase())
      );

      if (!match) return;

      const [matchedTitle, { link, price: realPrice }] = match;
      const dpsValue = realPrice / priceShells;
      
      dpsValues.push({
        card,
        dpsValue,
        priceShells,
        itemName,
        match
      });
    }
  });

  const sortedDps = [...dpsValues].sort((a, b) => b.dpsValue - a.dpsValue);
  
  const dpsRankings = {};
  sortedDps.forEach((item, index) => {
    dpsRankings[item.dpsValue] = index + 1;
  });

  console.log('DPS Values (Highest to Lowest):');
  console.log('================================');
  sortedDps.forEach((item, index) => {
    console.log(`Rank #${index + 1}: ${item.itemName} - $${item.dpsValue.toFixed(2)} per shell (${item.priceShells} shells, $${item.match[1].price.toFixed(2)})`);
  });

  dpsValues.forEach(({ card, dpsValue, priceShells, itemName, match }) => {
    const [matchedTitle, { link, price: realPrice }] = match;
    const rank = dpsRankings[dpsValue];

    const shellImg = `<img src="https://summer.hackclub.com/shell.avif" alt="shell" style="width:16px; height:16px; vertical-align:middle; display:inline-block;">`;
    const newTimeText =
      `${(priceShells / 10).toFixed(1)} hrs for 10 ${shellImg} per hour <br>` +
      `${(priceShells / 15).toFixed(1)} hrs for 15 ${shellImg} per hour <br>` +
      `${(priceShells / 20).toFixed(1)} hrs for 20 ${shellImg} per hour <br>` +
      `${(priceShells / 25).toFixed(1)} hrs for 25 ${shellImg} per hour <br>`;

    const timeEstimateEl = card.querySelector('div.text-xs.text-gray-500.mt-2');
    if (timeEstimateEl) {
      timeEstimateEl.innerHTML = newTimeText;
    }

    const titleEl = card.querySelector('h3');
    const linkEl = document.createElement('a');
    linkEl.href = link;
    linkEl.textContent = itemName;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.className = 'text-blue-600 underline';
    titleEl.replaceWith(linkEl);

    const priceP = document.createElement('p');
    priceP.textContent = `$${realPrice.toFixed(2)}`;
    priceP.className = 'text-sm text-gray-700 mt-1';
    linkEl.insertAdjacentElement('afterend', priceP);

    const dps = document.createElement('p');
    dps.textContent = `$${dpsValue.toFixed(2)} per shell (Rank #${rank})`;
    dps.className = 'text-sm text-gray-700 mt-1';
    priceP.insertAdjacentElement('afterend', dps);
  });
})();
