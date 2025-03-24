import { Test, TestingModule } from '@nestjs/testing';
import { TypesService } from '@/modules/pokemons/services/types.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('TypesService', () => {
  let service: TypesService;

  const mockPrismaService = {
    types: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    mockPrismaService.types.upsert.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TypesService>(TypesService);
  });

  describe('findOrCreateMany', () => {
    it('should find or create types in lowercase', async () => {
      const types = ['Electric', 'Fire'];
      const mockTypes = [
        { id: 1, name: 'electric' },
        { id: 2, name: 'fire' },
      ];

      mockPrismaService.types.upsert
        .mockResolvedValueOnce(mockTypes[0])
        .mockResolvedValueOnce(mockTypes[1]);

      const result = await service.findOrCreateMany(types);

      expect(result).toEqual(mockTypes);

      expect(mockPrismaService.types.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.types.upsert).toHaveBeenCalledWith({
        where: { name: 'electric' },
        update: {},
        create: { name: 'electric' },
      });
      expect(mockPrismaService.types.upsert).toHaveBeenCalledWith({
        where: { name: 'fire' },
        update: {},
        create: { name: 'fire' },
      });
    });

    it('should handle an empty array of types', async () => {
      const types: string[] = [];
      const result = await service.findOrCreateMany(types);

      expect(result).toEqual([]);

      expect(mockPrismaService.types.upsert).not.toHaveBeenCalled();
    });

    it('should handle duplicate types in the input array', async () => {
      const types = ['Electric', 'Electric'];
      const mockType = { id: 1, name: 'electric' };

      mockPrismaService.types.upsert = jest.fn().mockResolvedValue(mockType);

      const result = await service.findOrCreateMany(types);

      expect(result).toEqual([mockType, mockType]);

      expect(mockPrismaService.types.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.types.upsert).toHaveBeenCalledWith({
        where: { name: 'electric' },
        update: {},
        create: { name: 'electric' },
      });
    });
  });
});
