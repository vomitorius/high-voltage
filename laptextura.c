#include <stdlib.h>
#include <math.h>
#include <stdio.h>

#ifdef __APPLE__
#include <GLUT/glut.h>
#else
#include <GL/glut.h>
#endif

#include "bitmap.h"

// Define a constant for the value of PI
#define GL_PI 3.1415f

// Put here your own global variables and procedures
static int MenuID;

static float xRot = 0.0;
static float yRot = 0.0;

static int dMode = 0;

void StrokeText(char *string) {
    int len, i;
    len = (int) strlen (string);
    for (i = 0; i < len; i++) {
        glutStrokeCharacter (GLUT_STROKE_ROMAN, string[i]);
    }
}

// Called to draw scene
void RenderScene(void)
{
    int i;
    
    // Clear the window with current clearing color
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    glPushMatrix();
    
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);
    
    glColor3f(0.7, 0.7, 0.7);
    
    if (dMode == 0) {
        
        //	FRONT
        
        glBegin(GL_QUADS);
        glTexCoord2f(0.0, 0.0);  glVertex3f(-20.0, -20.0, 0.01);
        glTexCoord2f(1.0, 0.0);  glVertex3f(20.0, -20.0, 0.01);
        glTexCoord2f(1.0, 1.0);  glVertex3f(20.0, 20.0, 0.01);
        glTexCoord2f(0.0, 1.0);  glVertex3f(-20.0, 20.0, 0.01);
        glEnd();
        
        //	BACK
        
        glBegin(GL_QUADS);
        glTexCoord2f(1.0, 0.0);  glVertex3f(-20.0, -20.0, -0.01);
        glTexCoord2f(0.0, 0.0);  glVertex3f(20.0, -20.0, -0.01);
        glTexCoord2f(0.0, 1.0);  glVertex3f(20.0, 20.0, -0.01);
        glTexCoord2f(1.0, 1.0);  glVertex3f(-20.0, 20.0, -0.01);
        glEnd();
        
    } else if (dMode == 1) {
        
        //	FRONT
        
        glBegin(GL_QUADS);
        glTexCoord2f(0.0, 0.0);  glVertex3f(-20.0, -20.0, 0.01);
        glTexCoord2f(1.0, 0.0);  glVertex3f(20.0, -20.0, 0.01);
        glTexCoord2f(1.0, 1.0);  glVertex3f(10.0, 10.0, 0.01);
        glTexCoord2f(0.0, 1.0);  glVertex3f(-10.0, 10.0, 0.01);
        glEnd();
        
        //	BACK
        
        glBegin(GL_QUADS);
        glTexCoord2f(1.0, 0.0);  glVertex3f(-20.0, -20.0, -0.01);
        glTexCoord2f(0.0, 0.0);  glVertex3f(20.0, -20.0, -0.01);
        glTexCoord2f(0.0, 1.0);  glVertex3f(10.0, 10.0, -0.01);
        glTexCoord2f(1.0, 1.0);  glVertex3f(-10.0, 10.0, -0.01);
        glEnd();
        
    } else if (dMode == 2) {
        
        //	FRONT
        
        glBegin(GL_POLYGON);
        for (i=0; i<50; i++) {
            glTexCoord2f(0.5-0.5*cos((GLfloat)i*GL_PI/25.0), 0.5-0.5*sin((GLfloat)i*GL_PI/25.0));
            glVertex3f(-20.0*cos((GLfloat)i*GL_PI/25.0), -20.0*sin((GLfloat)i*GL_PI/25.0), 0.01);
        }
        glEnd();
        
        //	BACK
        
        glBegin(GL_POLYGON);
        for (i=0; i<50; i++) {
            glTexCoord2f(0.5+0.5*cos((GLfloat)i*GL_PI/25.0), 0.5-0.5*sin((GLfloat)i*GL_PI/25.0));
            glVertex3f(-20.0*cos((GLfloat)i*GL_PI/25.0), -20.0*sin((GLfloat)i*GL_PI/25.0), -0.01);
        }
        glEnd();
        
    }
    
    glPopMatrix();
    
    // Flush drawing commands
    glutSwapBuffers();
}

// This function does any needed initialization on the rendering
// context. 
void SetupRC()
{
    BITMAPINFO *texInfo; 
    GLubyte    *texBits; 
    
    // Black background
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f );
    glEnable(GL_DEPTH_TEST);
    
    texBits = LoadDIBitmap("DONOTENT.bmp", &texInfo);
    
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexEnvi(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE);
    
    glTexImage2D(GL_TEXTURE_2D, 0, 3, texInfo->bmiHeader.biWidth, texInfo->bmiHeader.biHeight, 0, GL_RGB, GL_UNSIGNED_BYTE, texBits);
    glEnable(GL_TEXTURE_2D);
    
    glEnable(GL_DEPTH_TEST);
    
    glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, GL_TRUE);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
}

void SpecialKeys(int key, int x, int y)
{
    
	if(key == GLUT_KEY_UP)
		xRot-= 5.0f;
    
	if(key == GLUT_KEY_DOWN)
		xRot += 5.0f;
    
	if(key == GLUT_KEY_LEFT)
		yRot -= 5.0f;
    
	if(key == GLUT_KEY_RIGHT)
		yRot += 5.0f;
    
	if(key > 356.0f)
		xRot = 0.0f;
    
	if(key < -1.0f)
		xRot = 355.0f;
    
	if(key > 356.0f)
		yRot = 0.0f;
    
	if(key < -1.0f)
		yRot = 355.0f;
    
    // Refresh the Window
    glutPostRedisplay();
}

void Keyboard(unsigned char key, int x, int y)
{
    
    // ...
    
    glutPostRedisplay();
}

void Timer(int value)
{
    
    // ...
    
    glutPostRedisplay();
    glutTimerFunc(1000, Timer, value + 1);
}

void Idle()
{
    glutPostRedisplay();
}

void ChangeSize(GLsizei w, GLsizei h)
{
    GLfloat fAspect;
    
    // Prevent a divide by zero
    if(h == 0)
        h = 1;
    
    // Set Viewport to window dimensions
    glViewport(0, 0, w, h);
    
    fAspect = (GLfloat)w/(GLfloat)h;
    
    // Reset coordinate system
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    
    // Produce the perspective projection
    gluPerspective(60.0f,    // fovy
                   fAspect,  // aspect
                   10.0,     // zNear
                   100.0     // zFar
                   );
    
    // Positioning the camera
    gluLookAt(0.0, 0.0, 50.0, // eye
              0.0, 0.0, 0.0,  // center
              0.0, 1.0, 0.0   // up
              );
    
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void ProcessMenu(int value)
{
    switch(value)
    {
        case 1:
            dMode = 0;
            break;
            
        case 2:
            dMode = 1;
            break;
            
        case 3:
            dMode = 2;
            break;
            
        case 4:
            exit(0);
            break;
            
        default:
            break;
    }
    
    glutPostRedisplay();
}

int main(int argc, char* argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutCreateWindow("Kor-alaku textura polygonon");
    glutReshapeFunc(ChangeSize);
    glutSpecialFunc(SpecialKeys);
    glutKeyboardFunc(Keyboard);
    glutDisplayFunc(RenderScene);
    glutTimerFunc(1000, Timer, 1); // 1 mp mulva meghivodik a Timer() fuggveny
    glutIdleFunc(Idle); // Idle(), ha nem tortenik semmi
    
    MenuID = glutCreateMenu(ProcessMenu);
    glutAddMenuEntry("Negyzetes textura negyzetre feszitve", 1);
    glutAddMenuEntry("Negyzetes textura trapezra feszitve", 2);
    glutAddMenuEntry("Kor alaku textura korre feszitve", 3);
    glutAddMenuEntry("Kilepes", 3);
    glutAttachMenu(GLUT_RIGHT_BUTTON);
    
    SetupRC();
    glutMainLoop();
    
    return 0;
}