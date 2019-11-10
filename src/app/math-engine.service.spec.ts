import { TestBed } from '@angular/core/testing';

import { MathEngineService } from './math-engine.service';

describe('MathEngineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MathEngineService = TestBed.get(MathEngineService);
    expect(service).toBeTruthy();
  });
});
