Unit Testing Summary

Auth Lambda:
- Test user registration with valid input
- Test duplicate email registration
- Test login with valid credentials
- Test login with wrong password

Flight Lambda:
- Test GET /flights
- Test POST /flights as admin
- Test PUT /flights/{id} as admin/staff
- Test passenger cannot create/update flights

Booking Lambda:
- Test booking with valid flight and seats
- Test booking without JWT
- Test booking with unavailable seats
- Test seat count decreases after booking

Baggage Lambda:
- Test create baggage
- Test update selected baggage status
- Test missing baggage record returns 404

Notification Lambda:
- Test EventBridge event creates notification
- Test user only sees own notifications