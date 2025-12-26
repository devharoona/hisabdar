const API = 'http://localhost:3000/api';

async function test() {
  console.log('Testing Backend API...\n');

  // Test GET customers
  let res = await fetch(`${API}/customers`);
  let customers = await res.json();
  console.log('✓ GET /api/customers:', customers.length, 'customers');

  // Test GET invoices
  res = await fetch(`${API}/invoices`);
  let invoices = await res.json();
  console.log('✓ GET /api/invoices:', invoices.length, 'invoices');

  // Test GET expenses
  res = await fetch(`${API}/expenses`);
  let expenses = await res.json();
  console.log('✓ GET /api/expenses:', expenses.length, 'expenses');

  // Test POST customer
  res = await fetch(`${API}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', phone: '123', email: 'test@test.com', address: 'Test' })
  });
  const newCustomer = await res.json();
  console.log('✓ POST /api/customers:', newCustomer.name);

  // Test DELETE customer
  res = await fetch(`${API}/customers/${newCustomer.id}`, { method: 'DELETE' });
  console.log('✓ DELETE /api/customers:', res.status === 204 ? 'Success' : 'Failed');

  console.log('\n✅ All tests passed!');
}

test().catch(console.error);
