document.getElementById('dreamButton').addEventListener('click', async () => {
    console.log('Button clicked');
    document.getElementById('statusMessage').textContent = 'Fetching data...';

    try {
        const response = await fetch('/runTask', { method: 'GET' });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Received Data:', data); // Debugging

        // Update the BTC and ETH allocation divs based on the received data
        document.getElementById('btcAllocation').textContent = `BTC Allocation: ${data.btc_position}`;
        document.getElementById('ethAllocation').textContent = `ETH Allocation: ${data.eth_position}`;
        document.getElementById('statusMessage').textContent = 'Data fetched successfully!';
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('btcAllocation').textContent = 'Error fetching BTC data';
        document.getElementById('ethAllocation').textContent = 'Error fetching ETH data';
        document.getElementById('statusMessage').textContent = 'Failed to fetch data';
    }
});
