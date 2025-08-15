#include <stdlib.h>
#include <math.h>

#ifdef __APPLE__
#include <GLUT/glut.h>
#else
#include <GL/glut.h>
#endif

//angle of rotation
float xpos = 1, ypos = 20, zpos = 50, xrot = 10, yrot = 0, angle=0.0;

//positions of the cubes
float positionz[10];
float positionx[10];


//=============================================
// DRAW CUBOID ROUTINES
//=============================================
//Cube points and colours

float vertices[][3] = 
{
    {-0.5,-0.5,-0.5},{0.5,-0.5,-0.5},
    {0.5,0.5,-0.5}, {-0.5,0.5,-0.5}, {-0.5,-0.5,0.5}, 
    {0.5,-0.5,0.5}, {0.5,0.5,0.5}, {-0.5,0.5,0.5}
};

float colors[][3] = {{0.0,0.5,0.5},{1.0,0.0,0.0},
    {1.0,1.0,0.0}, {0.0,1.0,0.0}, {0.0,0.0,1.0}, 
    {1.0,0.0,1.0}, {1.0,1.0,1.0}, {0.0,1.0,1.0}};


void polygon(int a, int b, int c , int d)
{
    // draw a polygon using colour of first vertex
    
    glBegin(GL_POLYGON);
    glVertex3fv(vertices[a]);
    glVertex3fv(vertices[b]);
    glVertex3fv(vertices[c]);
    glVertex3fv(vertices[d]);
    glEnd();
}

void cube(void)
{
    //Draw unit cube centred on the origin
    
    /* map vertices to faces */
    
    polygon(0,3,2,1);
    polygon(2,3,7,6);
    polygon(4,7,3,0);
    polygon(1,2,6,5);
    polygon(7,4,5,6);
    polygon(5,4,0,1);
}

void draw_cuboid(float x, float y, float z)
{
    glPushMatrix();
    //size cuboid
    glScalef(x,y,z);
    // move base up so that bottom face is at origin
    glTranslatef(0,0.5,0.0); 
    cube();
    glPopMatrix();
}   


//=============================================

void cubepositions (void) { //set the positions of the cubes
    
    for (int i=0;i<10;i++)
    {
        positionz[i] = rand()%5 + 5;
        positionx[i] = rand()%5 + 5;
    }
}

void init (void) {
    cubepositions();
}

void enable (void) {
    GLfloat  ambientLight[] = { 0.3f, 0.3f, 0.3f, 1.0f };
	GLfloat  diffuseLight[] = { 0.7f, 0.7f, 0.7f, 1.0f };
    
	glEnable(GL_LIGHTING);
	glLightfv(GL_LIGHT0,GL_AMBIENT,ambientLight);
	glLightfv(GL_LIGHT0,GL_DIFFUSE,diffuseLight);
	glEnable(GL_LIGHT0);
    
	glEnable(GL_DEPTH_TEST);	// melyseg teszt vegzese (z-buffer)
	glShadeModel(GL_SMOOTH);      // arnyekolasi mod 
	glDisable(GL_CULL_FACE);
	
	// Enable color tracking
	glEnable(GL_COLOR_MATERIAL);
	
	// Set Material properties to follow glColor values
	glColorMaterial(GL_FRONT, GL_AMBIENT_AND_DIFFUSE);    glShadeModel (GL_SMOOTH); //set the shader to smooth shader
    
}

void camera (void) {
    glRotatef(xrot,1.0,0.0,0.0);  //rotate our camera on teh x-axis (left and right)
    glRotatef(yrot,0.0,1.0,0.0);  //rotate our camera on the y-axis (up and down)
    glTranslated(-xpos,-ypos,-zpos); //translate the screento the position of our camera
}


void henger(float r, float h)
{
  	GLUquadricObj* hen;
  	hen = gluNewQuadric();
  	glPushMatrix();
  	glRotatef(0,0,1,0);
  	gluDisk(hen,0,r,20,20);
  	glPopMatrix();
    
  	glPushMatrix();
  	glTranslatef(0,0,h);
  	glRotatef(0,0,1,0);
  	gluDisk(hen,0,r,20,20);
  	glPopMatrix();
    
  	gluCylinder(hen,r,r,h,20,20);
  	gluDeleteQuadric(hen);
}

void display (void) {
    glClearColor (0.0,0.0,0.0,1.0); //clear the screen to black
    glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); //clear the color buffer and the depth buffer
    glLoadIdentity();  
    camera();
    enable();
    
    
    
    //Lámpa beállítása
    GLfloat	 lightPos[] = { 0.0f, 30.0f, -15.0f, 1.0f };
        glPushMatrix();
        glRotatef(0,0,1,0);
        glTranslatef(0.0f, 30.0f, -15.0f);
        glDisable(GL_LIGHTING);
        glColor3f(1,1,0.8);
        glutSolidSphere(1,10,10);
        glEnable(GL_LIGHTING);
        glLightfv(GL_LIGHT0,GL_POSITION,lightPos);
        glPopMatrix();
    
    
       
    //Padló
    glPushMatrix();
        glColor3f(1,1,1);
        glTranslatef(0.0f, -0.2f, 0.0f);
        draw_cuboid(50.0f, 0.2f, 30.f);
    glPopMatrix();

    glPushMatrix();
        glColor3f(1,1,0); 
        glTranslatef(-20.0f, 0.0f, 8.0f);
        draw_cuboid(8.0f, 2.0f, 12.f);
    glPopMatrix();

    
    
    
    glutSwapBuffers(); //swap the buffers
    angle++; //increase the angle
}




void reshape (int w, int h) {
    glViewport (0, 0, (GLsizei)w, (GLsizei)h); //set the viewportto the current window specifications
    glMatrixMode (GL_PROJECTION); //set the matrix to projection
    
    glLoadIdentity ();
    gluPerspective (60, (GLfloat)w / (GLfloat)h, 1.0, 1000.0
                    ); //set the perspective (angle of sight, width, height, , depth)
    glMatrixMode (GL_MODELVIEW); //set the matrix back to model
    
}

void pressKey(int key, int xx, int yy) {
    
    if (key==GLUT_KEY_UP)
    {
        float xrotrad, yrotrad;
        yrotrad = (yrot / 180 * 3.141592654f);
        xrotrad = (xrot / 180 * 3.141592654f); 
        xpos += (sin(yrotrad)) /2;
        zpos -= (cos(yrotrad)) /2;
        ypos -= (sin(xrotrad)) /2;
    }
    
    if (key==GLUT_KEY_DOWN)
    {
        float xrotrad, yrotrad;
        yrotrad = (yrot / 180 * 3.141592654f);
        xrotrad = (xrot / 180 * 3.141592654f); 
        xpos -= (sin(yrotrad))/2;
        zpos += (cos(yrotrad))/2;
        ypos += (sin(xrotrad))/2;
    }
    
    if (key==GLUT_KEY_RIGHT)
    {
        yrot += 1;
        if (yrot >360) yrot -= 360;
    }
    
    if (key==GLUT_KEY_LEFT)
    {
        yrot -= 1;
        if (yrot < -360)yrot += 360;
    }

} 


void keyboard (unsigned char key, int x, int y) {
    if (key=='y')
    {
        xrot += 1;
        if (xrot >360) xrot -= 360;
    }
    
    if (key=='a')
    {
        xrot -= 1;
        if (xrot < -360) xrot += 360;
    }
    if (key=='s')
    {
        ypos+=0.5;
    }
    
    if (key=='x')
    {
        ypos-=0.5;
    }

    
        if (key==27)
    {
        exit(0);
    }
}

int main (int argc, char **argv) {
    glutInit (&argc, argv);
    glutInitDisplayMode (GLUT_DOUBLE | GLUT_DEPTH | GLUT_RGBA); //set the display to Double buffer, with depth
    glutInitWindowSize (800, 600); //set the window size
    glutInitWindowPosition (100, 100); //set the position of the windowglutCreateWindow (“A basic OpenGL Window“); //the captionof the window
    glutCreateWindow("Camera");
    init (); //call the init function
    glutDisplayFunc (display); //use the display function to draw everything
    glutIdleFunc (display); //update any variables in display,display can be changed to anyhing, as long as you move the variables to be updated, in this case, angle++;
    glutReshapeFunc (reshape); //reshape the window accordingly
    glutIgnoreKeyRepeat(0);
    glutKeyboardFunc (keyboard); //check the keyboard
    glutSpecialFunc(pressKey);
    glutMainLoop (); //call the main loop
    return 1;
}
