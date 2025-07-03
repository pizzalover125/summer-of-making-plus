(function() {
    function convertTimeToDecimal(timeText) {
        const hoursMatch = timeText.match(/(\d+)h/);
        const minutesMatch = timeText.match(/(\d+)m/);
        
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        
        const decimalHours = hours + (minutes / 60);
        
        return decimalHours.toFixed(2);
    }
    
    function addDecimalHours() {
        const projectCards = document.querySelectorAll('a[href^="/projects/"]');
        
        projectCards.forEach(card => {
            const textElements = card.querySelectorAll('p');
            
            textElements.forEach(p => {
                if (p.textContent.includes('devlogs') && !p.querySelector('.decimal-hours')) {
                    const lines = p.innerHTML.split('<br>');
                    let timeText = '';
                    
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('h') && lines[i].includes('m')) {
                            timeText = lines[i].trim();
                        }
                        
                        if (lines[i].includes('devlogs')) {
                            const decimalHours = convertTimeToDecimal(timeText);
                            const minShells = Math.round(decimalHours * 10);
                            const maxShells = Math.round(decimalHours * 20);
                            lines[i] += '<br><span class="decimal-hours">' + minShells + ' <img src="https://summer.hackclub.com/shell.avif" style="display: inline-block; width: 16px; height: 16px; vertical-align: middle;"> to ' + maxShells + ' <img src="https://summer.hackclub.com/shell.avif" style="display: inline-block; width: 16px; height: 16px; vertical-align: middle;"></span>';
                            break;
                        }
                    }
                    
                    p.innerHTML = lines.join('<br>');
                }
            });
        });
    }
    
    addDecimalHours();
})();