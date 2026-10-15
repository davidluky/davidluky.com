import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { projects, publicWebProjects, featuredProjects } from '../src/data/projects';
import { projectStories } from '../src/data/project-stories';

describe('public catalog boundaries', () => {
  it('keeps private-source public products, demos and restricted destinations distinct', () => {
    expect(projects.find(p => p.id === 'digipets')).toMatchObject({ visibility: 'private', availability: 'public' });
    expect(projects.find(p => p.id === 'posop')).toMatchObject({ availability: 'demo', releaseState: 'development' });
    expect(projects.find(p => p.id === 'matheus-manual-pescados')).toMatchObject({ availability: 'restricted' });
    expect(publicWebProjects.map(p => p.id)).toEqual(expect.arrayContaining(['ada-delicacy-studio', 'the-room-web', 'davidluky-com']));
    expect(publicWebProjects.some(p => ['digipets', 'posop', 'matheus-manual-pescados'].includes(p.id))).toBe(false);
  });
  it('connects every story and featured project to an existing destination and image', () => {
    expect(new Set(projects.map(p => p.id)).size).toBe(projects.length);
    expect(featuredProjects).toHaveLength(6);
    for (const project of featuredProjects) {
      expect(Boolean(project.detailSlug || project.liveUrl)).toBe(true);
      expect(project.image && existsSync(`public${project.image}`)).toBe(true);
    }
    for (const story of projectStories) {
      expect(projects.find(p => p.detailSlug === story.id)).toBeDefined();
      for (const asset of [story.cover, ...story.gallery.map(item => item.src)]) expect(existsSync(`public${asset}`)).toBe(true);
    }
    expect(projects.filter(p => p.detailSlug).map(p => p.detailSlug).sort()).toEqual(projectStories.map(p => p.id).sort());
  });
});
