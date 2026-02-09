# TypeScript Setup - Complete Guide

## Quick Start

### Step 1: Install TypeScript Dependencies

**Backend:**
```bash
cd backend
npm install --save-dev typescript @types/node @types/express @types/pg @types/cors ts-node nodemon
```

**Frontend:**
```bash
cd frontend
npm install --save-dev typescript @types/react @types/react-dom
```

### Step 2: Update package.json Files

Replace your current `package.json` files with the TypeScript versions:
- `backend/package.json.ts` → Copy to `backend/package.json`
- `frontend/package.json.ts` → Copy to `frontend/package.json`

### Step 3: TypeScript Config Files

✅ Already created:
- `backend/tsconfig.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`

### Step 4: Type Definitions

✅ Already created:
- `backend/src/types/database.ts`
- `backend/src/types/api.ts`
- `frontend/src/types/index.ts`

### Step 5: Convert Files Gradually

Start with one file at a time:
1. Copy `.js` → `.ts` (or `.jsx` → `.tsx`)
2. Follow patterns in `TYPESCRIPT_EXAMPLES.md`
3. Fix TypeScript errors
4. Test the file
5. Move to next file

### Step 6: Build and Test

**Backend:**
```bash
cd backend
npm run build  # Compile TypeScript
npm run dev    # Run in development mode
```

**Frontend:**
```bash
cd frontend
npm run build  # Build for production
npm run dev    # Run in development mode
```

## File Structure After Conversion

```
backend/
├── tsconfig.json
├── package.json (updated)
├── src/
│   ├── server.ts (converted from .js)
│   ├── config/
│   │   └── database.ts
│   ├── types/
│   │   ├── database.ts ✅
│   │   └── api.ts ✅
│   ├── models/
│   │   └── *.ts (convert from .js)
│   ├── controllers/
│   │   └── *.ts (convert from .js)
│   ├── routes/
│   │   └── *.ts (convert from .js)
│   └── services/
│       └── *.ts (convert from .js)
└── dist/ (generated after build)

frontend/
├── tsconfig.json ✅
├── tsconfig.node.json ✅
├── vite.config.ts (convert from .js)
├── package.json (updated)
└── src/
    ├── types/
    │   └── index.ts ✅
    ├── *.tsx (convert from .jsx)
    └── components/
        └── **/*.tsx
```

## Conversion Order (Recommended)

### Phase 1: Backend Foundation
1. `config/database.js` → `database.ts`
2. `server.js` → `server.ts`
3. One model (e.g., `Radiologist.js` → `Radiologist.ts`)
4. One controller (e.g., `radiologistController.js` → `radiologistController.ts`)
5. One route (e.g., `radiologists.js` → `radiologists.ts`)

### Phase 2: Complete Backend
6. Convert all models
7. Convert all controllers
8. Convert all routes
9. Convert all services

### Phase 3: Frontend
10. `App.jsx` → `App.tsx`
11. `index.jsx` → `index.tsx`
12. Convert pages one by one
13. Convert components one by one

## Testing After Conversion

After converting each file:
1. Run `npm run type-check` (if available)
2. Run `npm run dev` and test functionality
3. Fix any TypeScript errors
4. Commit your changes

## Common Issues & Solutions

### Issue: Module not found
**Solution**: Check import paths, ensure `.ts` extension is correct

### Issue: Type errors
**Solution**: Add proper type annotations, use `as Type` for type assertions

### Issue: Express types
**Solution**: Import `Request` and `Response` from `express`

### Issue: Database query types
**Solution**: Use type assertions: `result.rows as RowType[]`

## Next Steps

1. ✅ TypeScript configs created
2. ✅ Type definitions created
3. ✅ Example conversions documented
4. ⏳ Convert files gradually
5. ⏳ Test thoroughly
6. ⏳ Deploy (see DEPLOYMENT.md)

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- See `TYPESCRIPT_EXAMPLES.md` for conversion patterns
- See `DEPLOYMENT.md` for deployment options
