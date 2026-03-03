import { BaseScraper } from './base-scraper';
import { CrimsonScraper } from './newspapers/crimson';
import { YDNScraper } from './newspapers/yale-daily-news';
import { PrincetonianScraper } from './newspapers/princetonian';
import { SpectatorScraper } from './newspapers/spectator';
import { DPScraper } from './newspapers/daily-pennsylvanian';
import { HeraldScraper } from './newspapers/brown-daily-herald';
import { DartmouthScraper } from './newspapers/dartmouth';
import { SunScraper } from './newspapers/cornell-sun';
import { StanfordDailyScraper } from './newspapers/stanford-daily';
import { TheTechScraper } from './newspapers/the-tech';
import { CalTechScraper } from './newspapers/california-tech';
import { TartanScraper } from './newspapers/tartan';
import { TuftsDailyScraper } from './newspapers/tufts-daily';
import { TechniqueScraper } from './newspapers/technique';

export const scrapers: Record<string, BaseScraper> = {
  crimson: new CrimsonScraper(),
  ydn: new YDNScraper(),
  princetonian: new PrincetonianScraper(),
  spectator: new SpectatorScraper(),
  dp: new DPScraper(),
  herald: new HeraldScraper(),
  dartmouth: new DartmouthScraper(),
  sun: new SunScraper(),
  stanforddaily: new StanfordDailyScraper(),
  thetech: new TheTechScraper(),
  caltech: new CalTechScraper(),
  tartan: new TartanScraper(),
  tuftsdaily: new TuftsDailyScraper(),
  technique: new TechniqueScraper(),
};
