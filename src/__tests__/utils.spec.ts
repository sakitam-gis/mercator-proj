import {
  FRAGMENT_SHADER_PROLOGUE
} from '../utils';

test('equal', () => {
  expect(FRAGMENT_SHADER_PROLOGUE).toBe(`\
precision highp float;
`);
});
