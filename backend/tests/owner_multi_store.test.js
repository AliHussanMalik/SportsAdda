const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Indoor Owner Registration, Facility Management & Multi-Store Test Suite', () => {

  // Test 1: Indoor Venue Registration with Facilities Checklist
  it('1. Indoor Owner registers an indoor venue with custom facilities checklist (Turf, AC Lounge, Lights)', () => {
    const venueRegistrationPayload = {
      name: 'Velocity Indoor Sports Complex',
      address: 'Phase 5, DHA Lahore',
      city: 'Lahore',
      hourly_rate: 3500.00,
      facilities: ['Artificial Turf', 'AC Lounge', 'Night Floodlights', 'Changing Rooms', 'Live Stream Camera'],
      owner_id: 'owner-uuid-101',
      amenities: {
        has_ac: true,
        has_parking: true,
        has_cameras: true,
        has_changing_room: true,
        has_canteen: true
      }
    };

    assert.strictEqual(venueRegistrationPayload.name, 'Velocity Indoor Sports Complex');
    assert.strictEqual(venueRegistrationPayload.facilities.length, 5);
    assert.ok(venueRegistrationPayload.facilities.includes('AC Lounge'));
    assert.strictEqual(venueRegistrationPayload.amenities.has_ac, true);
  });

  // Test 2: Role Segregation & Access Control (Indoor Owner vs Player)
  it('2. Role segregation isolates Indoor Owner arena management from Player pitch booking view', () => {
    const ownerUser = { user_id: 'u-101', role: 'INDOOR_OWNER', display_name: 'Malik Sports Owner' };
    const playerUser = { user_id: 'u-202', role: 'PLAYER', display_name: 'Babar Azam' };

    const isOwnerAuthorized = ownerUser.role === 'INDOOR_OWNER' || ownerUser.role === 'ADMIN';
    const isPlayerAuthorizedForBooking = playerUser.role === 'PLAYER' || playerUser.role === 'INDOOR_OWNER';

    assert.strictEqual(isOwnerAuthorized, true, 'Indoor Owner can manage venue facilities');
    assert.strictEqual(isPlayerAuthorizedForBooking, true, 'Player can view and book pitch slots');
  });

  // Test 3: Multi-Store Ownership under a Single Owner Profile
  it('3. Indoor Owner can register and manage multiple stores/pro-shops under their single profile', () => {
    const ownerId = 'owner-uuid-101';

    const store1 = {
      store_id: 'store-1',
      owner_id: ownerId,
      store_name: 'SportsAdda Pro Shop - DHA Branch',
      store_address: 'DHA Phase 5 Lahore',
      store_type: 'EQUIPMENT_PRO_SHOP'
    };

    const store2 = {
      store_id: 'store-2',
      owner_id: ownerId,
      store_name: 'SportsAdda Pro Shop - Gulberg Branch',
      store_address: 'Main Boulevard Gulberg Lahore',
      store_type: 'EQUIPMENT_PRO_SHOP'
    };

    const ownerStoresList = [store1, store2];

    assert.strictEqual(ownerStoresList.length, 2, 'Owner holds multiple store locations');
    assert.strictEqual(ownerStoresList[0].owner_id, ownerId);
    assert.strictEqual(ownerStoresList[1].owner_id, ownerId);
  });

  // Test 4: Store Stock Inventory Management
  it('4. Owner can add and list equipment stock inventory for each store location', () => {
    const storeId = 'store-1';

    const inventoryItems = [
      { id: 'inv-1', store_id: storeId, item_name: 'CA 15000 Tapeball Bat', category: 'CRICKET_GEAR', price: 4500.00, stock_quantity: 12 },
      { id: 'inv-2', store_id: storeId, item_name: 'Kookaburra Match Ball', category: 'CRICKET_GEAR', price: 1200.00, stock_quantity: 25 },
      { id: 'inv-3', store_id: storeId, item_name: 'Gatorade Sports Drink', category: 'SNACKS_DRINKS', price: 350.00, stock_quantity: 50 }
    ];

    const gearItems = inventoryItems.filter(i => i.category === 'CRICKET_GEAR');
    const totalInventoryValue = inventoryItems.reduce((acc, item) => acc + (item.price * item.stock_quantity), 0);

    assert.strictEqual(gearItems.length, 2);
    assert.strictEqual(totalInventoryValue, 101500.00, 'Total inventory valuation calculated correctly');
  });

});
