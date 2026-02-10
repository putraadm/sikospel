# TODO: Implement Pemilik Menu and Form

## Backend Changes
- [x] Update AdminPemilikController index method to fetch and pass pemilik data (with user relation) and users list
- [x] Update AdminPemilikController store method: correct validation rules to match pemilik table (user_id, name, no_wa, address), implement creation logic using Pemilik model

## Frontend Changes
- [x] Create resources/js/pages/admin/pemilik.tsx: Implement a page similar to penghuni.tsx, with a table displaying pemilik data and a modal form for adding new pemilik. Form fields: select for user_id, text inputs for name, no_wa, address. Table columns: ID, Nama, Email, No. WA, Alamat, Aksi (Edit/Hapus placeholders)

## Testing
- [ ] Test adding a new pemilik via the form
- [ ] Verify data appears in table after save

# TODO: Activate Room and Kos Menus with Tables

## Backend Changes
- [x] Update AdminKosController index method to fetch kos data with owner relation and pemilik list
- [x] Update AdminKamarController index method to fetch rooms data with kos relation

## Frontend Changes
- [x] Implement resources/js/pages/admin/kos.tsx: Display table of kos with columns ID, Name, Address, Owner, Actions
- [x] Implement resources/js/pages/admin/room.tsx: Display table of rooms with columns ID, Room Number, Kos, Price, Status, Actions

## Testing
- [ ] Test Kos page displays table with data
- [ ] Test Room page displays table with data
