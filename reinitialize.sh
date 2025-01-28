#!/bin/sh

mv prisma/dev.db archives/$(date +\%Y-\%m-\%d).db
npx prisma migrate dev --name init
sqlite3 prisma/dev.db 'insert into User (email, name, team, isAdmin) values("mcoblenz@ucsd.edu", "Michael Coblenz", "", true);'

