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

  const regionSelectorContainer = document.querySelector('#region-selector').closest('.card-with-gradient');
  if (regionSelectorContainer) {
    const dpsButton = document.createElement('button');
    dpsButton.textContent = 'See DPS Rankings';
    dpsButton.className = 'w-full px-4 py-3 mt-3 bg-[#8b6f47] text-[#374151] border-2 border-[#8b6f47] rounded-lg hover:bg-[#75633e] focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:ring-offset-2 font-medium transition-colors duration-200';
    
    const cardContent = regionSelectorContainer.querySelector('.card-content');
    cardContent.appendChild(dpsButton);

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        ">
          <h2 style="
            font-size: 20px;
            font-weight: bold;
            color: #3a2f25;
            font-family: 'DynaPuff', sans-serif;
            margin: 0;
          ">🏆 DPS Rankings</h2>
          <button id="close-modal" style="
            color: #6b7280;
            font-size: 24px;
            font-weight: bold;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">&times;</button>
        </div>
        <div style="
          padding: 24px;
          overflow-y: auto;
          max-height: calc(80vh - 120px);
        ">
          <div id="rankings-content"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    function generateRankingsContent() {
      const rankingsContent = document.getElementById('rankings-content');
      let html = '<div>';
      
      sortedDps.forEach((item, index) => {
        const rank = index + 1;
        const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        
        html += `
          <div style="
            border: 1px solid ${rank <= 3 ? '#fbbf24' : '#d1d5db'};
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            background-color: ${rank <= 3 ? '#fffbeb' : '#f9fafb'};
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px; font-weight: bold;">${medalEmoji}</span>
                  <a href="${item.match[1].link}" target="_blank" rel="noopener noreferrer" 
                     style="
                       color: #2563eb;
                       text-decoration: underline;
                       font-weight: 500;
                     ">
                    ${item.itemName}
                  </a>
                </div>
                <div style="font-size: 14px; color: #4b5563;">
                  <div style="margin-bottom: 4px;"><strong>DPS Value:</strong> $${item.dpsValue.toFixed(2)} per shell</div>
                  <div><strong>Cost:</strong> ${item.priceShells} shells ($${item.match[1].price.toFixed(2)})</div>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      rankingsContent.innerHTML = html;
    }

    dpsButton.addEventListener('click', () => {
      generateRankingsContent();
      modal.style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }

  dpsValues.forEach(({ card, dpsValue, priceShells, itemName, match }) => {
    const [matchedTitle, { link, price: realPrice }] = match;
    const rank = dpsRankings[dpsValue];

    const shellImg = `<img src="https://summer.hackclub.com/shell.avif" alt="shell" style="width:16px; height:16px; vertical-align:middle; display:inline-block;">`;
    
    const timeEstimateEl = card.querySelector('div.text-xs.text-gray-500.mt-2');
    if (timeEstimateEl) {
      const containerDiv = document.createElement('div');
      
      const today = new Date();
      const endDate = new Date('2025-08-31T23:59:59');
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysRemaining = Math.max(1, Math.ceil((endDate - today) / msPerDay));

      function hoursPerDay(shellsPerHour) {
        const totalHours = priceShells / shellsPerHour;
        return (totalHours / daysRemaining).toFixed(2);
      }

      const defaultTimeText = `${(priceShells / 10).toFixed(1)} hrs for 10 ${shellImg} per hour | Hours / Day: ${hoursPerDay(10)}`;
      const defaultDiv = document.createElement('div');
      defaultDiv.innerHTML = defaultTimeText;

      const moreTimeText = 
        `${(priceShells / 5).toFixed(1)} hrs for 5 ${shellImg} per hour | Hours / Day: ${hoursPerDay(5)}<br>` +
        `${(priceShells / 15).toFixed(1)} hrs for 15 ${shellImg} per hour | Hours / Day: ${hoursPerDay(15)}<br>` +
        `${(priceShells / 20).toFixed(1)} hrs for 20 ${shellImg} per hour | Hours / Day: ${hoursPerDay(20)}<br>` +
        `${(priceShells / 25).toFixed(1)} hrs for 25 ${shellImg} per hour | Hours / Day: ${hoursPerDay(25)}<br>` +
        `${(priceShells / 30).toFixed(1)} hrs for 30 ${shellImg} per hour | Hours / Day: ${hoursPerDay(30)}`;
      
      const moreDiv = document.createElement('div');
      moreDiv.innerHTML = moreTimeText;
      moreDiv.style.display = 'none';
      
      const showMoreButton = document.createElement('button');
      showMoreButton.textContent = 'show more';
      showMoreButton.className = 'text-blue-600 underline text-xs mt-1 bg-none border-none cursor-pointer p-0';
      showMoreButton.style.background = 'none';
      showMoreButton.style.border = 'none';
      showMoreButton.style.padding = '0';
      
      const showLessButton = document.createElement('button');
      showLessButton.textContent = 'show less';
      showLessButton.className = 'text-blue-600 underline text-xs mt-1 bg-none border-none cursor-pointer p-0';
      showLessButton.style.background = 'none';
      showLessButton.style.border = 'none';
      showLessButton.style.padding = '0';
      showLessButton.style.display = 'none';
      
      showMoreButton.addEventListener('click', () => {
        moreDiv.style.display = 'block';
        showMoreButton.style.display = 'none';
        showLessButton.style.display = 'inline';
      });
      
      showLessButton.addEventListener('click', () => {
        moreDiv.style.display = 'none';
        showMoreButton.style.display = 'inline';
        showLessButton.style.display = 'none';
      });
      
      containerDiv.appendChild(defaultDiv);
      containerDiv.appendChild(showMoreButton);
      containerDiv.appendChild(moreDiv);
      containerDiv.appendChild(showLessButton);
      
      timeEstimateEl.replaceWith(containerDiv);
      containerDiv.className = timeEstimateEl.className;
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