const cards = document.querySelectorAll('.card-with-gradient');
cards.forEach((card, index) => {
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

  const price = parseFloat(quantity);
  const shellImg = `<img src="https://summer.hackclub.com/shell.avif" alt="shell" style="width:16px; height:16px; vertical-align:middle; display:inline-block;">`;
  const newTimeText = isNaN(price) ? 'N/A' : 
    `${(price / 10).toFixed(1)} hrs for 10 ${shellImg} per hour <br> ` +
    `${(price / 15).toFixed(1)} hrs for 15 ${shellImg} per hour <br> ` +
    `${(price / 20).toFixed(1)} hrs for 20 ${shellImg} per hour <br> ` +
    `${(price / 25).toFixed(1)} hrs for 25 ${shellImg} per hour <br>`;

  const timeEstimateEl = card.querySelector('div.text-xs.text-gray-500.mt-2');  
  if (timeEstimateEl) {
    timeEstimateEl.innerHTML = newTimeText;
  }
});
